// Анимация прорисовки маршрута:
gsap.to("#route", {
  duration: 4,
  strokeDashoffset: 0,
  ease: "power1.inOut"
});

// Движение "грузовика" (кружочка) по пути
// Используем MotionPathPlugin (входит в GSAP 3, но нужно подключить плагин отдельно 
// или использовать один из CDN-сборок, содержащих его):
// <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/MotionPathPlugin.min.js"></script>

gsap.registerPlugin(MotionPathPlugin);

gsap.to("#truck", {
  duration: 4,
  delay: 1,
  repeat: -1, // или убрать, если не нужно зацикливать
  ease: "power1.inOut",
  motionPath: {
    path: "#route",
    align: "#route",
    autoRotate: true,
    start: 0,
    end: 1
  }
});
