document.addEventListener("DOMContentLoaded", event => {
    const fileDropzone = document.getElementById("file-dropzone");
    const output = document.getElementById("output");

    if (window.FileList && window.File) {
        fileDropzone.addEventListener("dragover", event => {
            event.stopPropagation();
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
            fileDropzone.classList.add("dragover");
        });

        fileDropzone.addEventListener("dragleave", event => {
            fileDropzone.classList.remove("dragover");
        });

        fileDropzone.addEventListener("drop", event => {
            fileDropzone.classList.remove("dragover");
            event.stopPropagation();
            event.preventDefault();

            for (const file of event.dataTransfer.files) {
                const name = file.name;
                const size = file.size ? Math.round(file.size / 1000) : 0;

                if (file.type && file.type.startsWith("image/")) {
                    const li = document.createElement("li");
                    li.textContent = name + " (" + size + " KB)";
                    output.appendChild(li);
                }
            }
        });
    }
});