// ===============
// Базовая сцена
// ===============
let scene, camera, renderer, controls;
let planet, airplane;

// Параметры для анимации самолётика
let clock = new THREE.Clock();
let planeSpeed = 0.3; // скорость перелётов (можно подбирать)

// Координаты "Москвы" и "Владикавказа" на шаре (условные)
// Допустим, это lat/long, которые мы переведём в 3D-координаты
// Пример: Москва (55.7558 N, 37.6173 E), Владикавказ (43.0245 N, 44.6906 E)
const moscow = { lat: 55.7558, lon: 37.6173 };
const vladikavkaz = { lat: 43.0245, lon: 44.6906 };

init();
animate();

function init() {
  // Сцена
  scene = new THREE.Scene();

  // Камера
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.set(0, 0, 3);

  // Рендерер
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  const container = document.getElementById('planet-container');
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Управление мышью (OrbitControls)
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.minDistance = 1.5;
  controls.maxDistance = 10;

  // Создаём планету (сфера)
  const geometry = new THREE.SphereGeometry(1, 64, 64);
  // материал (простой шейдер или текстура)
  const material = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    roughness: 0.8
  });
  planet = new THREE.Mesh(geometry, material);
  scene.add(planet);

  // Свет
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 3, 5);
  scene.add(light);
  const ambient = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambient);

  // Добавим метки (маленькие точки) для Москвы и Владикавказа
  const markerGeom = new THREE.SphereGeometry(0.02, 8, 8);
  const markerMatMoscow = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const markerMatVlad = new THREE.MeshBasicMaterial({ color: 0x0000ff });

  let moscowMarker = new THREE.Mesh(markerGeom, markerMatMoscow);
  let vladMarker = new THREE.Mesh(markerGeom, markerMatVlad);

  // Конвертируем координаты (lat, lon) в позицию на сфере
  moscowMarker.position.copy(latLongToVector3(moscow.lat, moscow.lon, 1));
  vladMarker.position.copy(latLongToVector3(vladikavkaz.lat, vladikavkaz.lon, 1));

  planet.add(moscowMarker);
  planet.add(vladMarker);

  // "Самолётик" – пока сделаем примитив (маленький конус/стрелочку)
  const planeGeom = new THREE.ConeGeometry(0.02, 0.06, 8);
  const planeMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
  airplane = new THREE.Mesh(planeGeom, planeMat);
  airplane.rotation.x = Math.PI; // чтобы остриё было вперёд
  planet.add(airplane);

  // Начнём полёт от Москвы к Владикавказу
  airplane.userData = {
    from: moscowMarker.position.clone(),
    to: vladMarker.position.clone(),
    progress: 0,    // 0..1
    goingForward: true  // сначала Москва->Владикавказ
  };
}

// Функция для конвертации географических координат в 3D
function latLongToVector3(lat, lon, radius) {
  // перевод в радианы
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Анимация
function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();

  // Дампинг OrbitControls (плавность)
  controls.update();

  // Анимируем самолёт
  moveAirplane(delta);

  // Рендерим
  renderer.render(scene, camera);
}

function moveAirplane(dt) {
  if (!airplane) return;

  let data = airplane.userData;
  // Изменяем прогресс (0..1)
  if (data.goingForward) {
    data.progress += planeSpeed * dt;
    if (data.progress >= 1) {
      data.progress = 1;
      data.goingForward = false; // летим обратно
    }
  } else {
    data.progress -= planeSpeed * dt;
    if (data.progress <= 0) {
      data.progress = 0;
      data.goingForward = true; // меняем направление
    }
  }

  // Интерполируем позицию между from и to
  let fromPos = data.from;
  let toPos = data.to;
  let newPos = new THREE.Vector3().lerpVectors(fromPos, toPos, data.progress);
  airplane.position.copy(newPos);

  // Поворот самолётика по направлению движения
  // Определяем вектор направления
  let dir = new THREE.Vector3().subVectors(toPos, fromPos).normalize();
  if (!data.goingForward) {
    // Если летим обратно, направление наоборот
    dir.negate();
  }
  // Смотрим, куда "смотрит" самолет
  airplane.lookAt(airplane.position.clone().add(dir));
}
