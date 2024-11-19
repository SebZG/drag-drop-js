function dragMoveListener(event) {
    let target = event.target;
    let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}

function onDragEnter(event) {
    let draggableElement = event.relatedTarget;
    let dropzoneElement = event.target;
    draggableElement.classList.add("can-drop");
    dropzoneElement.classList.add("drop-target");
}

function onDragLeave(event) {
    event.relatedTarget.classList.remove("can-drop");
    event.target.classList.remove("drop-target");
}

function onDrop(event) {
    event.target.classList.remove("drop-target");
}

document.addEventListener("DOMContentLoaded", event => {
    window.dragMoveListener = dragMoveListener;

    interact("#dropzoneA").dropzone({
        accept: ".itemA",
        overlap: 0.75,
        ondragenter: onDragEnter,
        ondragleave: onDragLeave,
        ondrop: onDrop
    });

    interact("#dropzoneB").dropzone({
        accept: ".itemB",
        overlap: 0.75,
        ondragenter: onDragEnter,
        ondragleave: onDragLeave,
        ondrop: onDrop
    });

    interact(".draggable").draggable({
        inertia: true,
        autoScroll: true,
        modifiers: [
            interact.modifiers.restrictRect({
                restriction: "parent",
                endOnly: true
            })
        ],
        listeners: { 
            move: dragMoveListener
        }
    });
});