const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const titleInput = document.getElementById('title');
const submitBtn = document.getElementById('submitBtn');
const cropperModal = document.getElementById('cropperModal');
const cropperContainer = document.getElementById('cropperContainer');
const cropDoneBtn = document.getElementById('cropDoneBtn');
const emptyMessage = document.getElementById('emptyMessage');
let cropper = null;
let templateImage = new Image();
let croppedImage = null; // Menyimpan gambar yang telah di-crop
templateImage.src = 'template.png'; // Preload template image
let templateLoaded = false;
let imageUploaded = false; // Track if an image has been uploaded
const downloadImageBtn = document.getElementById('download-image');


// Preload template image
templateImage.onload = function() {
    templateLoaded = true;
};

// Handle image upload
imageUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Remove any existing cropper instances and temporary image
            if (cropper) {
                cropper.destroy();
                cropper = null;
            }

            // Remove any existing temporary image
            const tempImage = document.getElementById('tempImage');
            if (tempImage) {
                tempImage.remove();
            }

            // Create an image element and set its src attribute
            const img = document.createElement('img');
            img.src = e.target.result;
            img.id = 'tempImage';
            img.style.width = '100%'; // Ensure it fits within the modal
            img.style.height = 'auto'; // Maintain aspect ratio
            cropperContainer.innerHTML = ''; // Clear previous content
            cropperContainer.appendChild(img); // Add image to cropperContainer

            // Show the cropping modal
            cropperModal.style.display = 'flex';

            // Initialize Cropper.js on the image
            cropper = new Cropper(img, {
                aspectRatio: 1.74, // Set aspect ratio to 1.74:1
                viewMode: 1,
                autoCropArea: 0.5, // Start with 50% crop area
                background: true,
                movable: true,
                rotatable: true,
                scalable: true,
                zoomable: true,
                ready() {
                    console.log('Cropper ready');
                }
            });

            imageUploaded = true; // Update the flag
        };
        reader.readAsDataURL(file);
    }
});

// Handle crop done button click
cropDoneBtn.addEventListener('click', function() {
    if (cropper) {
        const croppedCanvas = cropper.getCroppedCanvas({
            width: 1060,
            height: 1060,
        });

        // Store the cropped image data
        croppedImage = croppedCanvas;

        // Draw the cropped image on the preview canvas
        drawCroppedImage();

        // Clean up Cropper.js and temporary image
        cropper.destroy();
        cropper = null;
        const tempImage = document.getElementById('tempImage');
        if (tempImage) {
            tempImage.remove();
        }

        // Hide the cropping modal
        cropperModal.style.display = 'none';
    }
});

// Update preview whenever title changes
titleInput.addEventListener('input', function() {
    drawCroppedImage(); // Update preview whenever title changes
});

function drawCroppedImage() {
    if (templateLoaded && croppedImage) {
        const ctx = imagePreview.getContext('2d');
        imagePreview.width = 1060;
        imagePreview.height = 1060;

        // Clear the canvas before drawing
        ctx.clearRect(0, 0, imagePreview.width, imagePreview.height);

        // Draw the cropped image from the user
        ctx.drawImage(croppedImage, 0, 0);

        // Draw the template on top
        ctx.drawImage(templateImage, 0, 0, 1060, 1060);

        // Prepare to draw the title text
        ctx.font = '600 40px Poppins'; // Font weight semibold with size 40px
        ctx.fillStyle = 'black'; // Text color black
        ctx.textAlign = 'center';

        // Calculate text wrapping
        const maxWidth = imagePreview.width - 100; // 50px padding on each side
        const title = titleInput.value;
        const words = title.split(' ');
        let line = '';
        const lineHeight = 50; // Adjust line height if necessary
        let y = 760; // Start Y position

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth) {
                ctx.fillText(line, imagePreview.width / 2, y);
                line = words[i] + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }

        // Draw the last line of text
        ctx.fillText(line, imagePreview.width / 2, y);

        // Hide the empty message
        emptyMessage.style.display = 'none';
    } else {
        // Show the empty message
        emptyMessage.style.display = 'flex';
    }

// Event listener untuk tombol unduh
downloadImageBtn.addEventListener('click', function() {
    if (croppedImage) {
        // Buat URL data dari canvas
        const dataURL = imagePreview.toDataURL('image/jpeg');

        // Buat elemen <a> sementara untuk mengunduh gambar
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'ig_post.jpg';
        link.click();
    } else {
        alert('Silakan unggah dan crop gambar terlebih dahulu.');
    }
});
}