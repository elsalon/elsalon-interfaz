// // plugins/fadeInObserver.js
// export default defineNuxtPlugin(() => {
//     const applyFadeInEffect = (element) => {
//       element.classList.add('fade-in');
//       if (element.complete || element.readyState === 4) {
//         element.classList.add('loaded');
//       } else {
//         element.addEventListener('load', () => element.classList.add('loaded'));
//       }
//     };
  
//     const observeElements = (mutationsList) => {
//       mutationsList.forEach((mutation) => {
//         if (mutation.type === 'childList') {
//           mutation.addedNodes.forEach((node) => {
//             if (node.tagName === 'IMG' || node.tagName === 'IFRAME') {
//               applyFadeInEffect(node);
//             } else if (node.querySelectorAll) {
//               node.querySelectorAll('img, iframe').forEach(applyFadeInEffect);
//             }
//           });
//         }
//       });
//     };
  
//     // Set up the MutationObserver on the app's main container
//     onMounted(() => {
//       const observer = new MutationObserver(observeElements);
//       const appContainer = document.querySelector('#__nuxt');
//       if (appContainer) {
//         observer.observe(appContainer, { childList: true, subtree: true });
//       }
//     });
//   });
  