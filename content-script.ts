const TARGET_CLASS = "my-target-class";

function handleAdded(el: Element) {
  console.log("added:", el);
}

function handleRemoved(el: Element) {
  console.log("removed:", el);
}

function scanNode(node: Node, fn: (el:Element)=>void | Promise<void>) {
  if (!(node instanceof Element)) return;

  // if the node itself matches
  if (node.classList.contains(TARGET_CLASS)) {
    fn(node);
  }

  // if it contains matching descendants
  node.querySelectorAll(`.${TARGET_CLASS}`).forEach(fn);
}

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach((node) => scanNode(node, handleAdded));
      mutation.removedNodes.forEach((node) => scanNode(node, handleRemoved));
    }

    if (mutation.type === "attributes" && mutation.attributeName === "class") {
      const el = mutation.target;
      if(!(el instanceof Element)){
        return
      }
      const hasClass = el.classList.contains(TARGET_CLASS);

      if (hasClass) {
        handleAdded(el);
      }
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["class"]
});