 // Import fungsi yang diperlukan dari Firebase SDK
 import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
 import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
 import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

 // Konfigurasi Firebase
 const firebaseConfig = {
    apiKey: "AIzaSyAz7u_Fy6AR3sH_ZLK5CTddiv529yN9yLg",
    authDomain: "personal-web-dopi.firebaseapp.com",
    projectId: "personal-web-dopi",
    storageBucket: "personal-web-dopi.firebasestorage.app",
    messagingSenderId: "717791869067",
    appId: "1:717791869067:web:25a3356fac3ab1c52b7c8e"
};

 // Inisialisasi Firebase
 const app = initializeApp(firebaseConfig);
 const auth = getAuth(app);
 const db = getFirestore(app);

 
    loadPortos();

     // Cek status login
     onAuthStateChanged(auth, (user) => {
        
    });


    // Fungsi untuk memuat To-Do List dari Firestore
    // Fungsi untuk memuat To-Do List dari Firestore
function loadPortos() {
    const loadingIndicator = document.getElementById('loadingIndicator');

    // Tampilkan loading indicator
    loadingIndicator.style.display = 'block';

    const q = query(collection(db, 'portofolios'));
    onSnapshot(q, (snapshot) => {
        const portos = [];
        snapshot.forEach((doc) => {
            portos.push({ id: doc.id, ...doc.data() });
        });

        // Sembunyikan loading indicator setelah data selesai dimuat
        loadingIndicator.style.display = 'none';

        // Render To-Do List
        renderPortolist(portos);
    });
}

function renderPortolist(portos) {
    const portfolioList = document.getElementById('portfolioList');
    portfolioList.innerHTML = ''; // Bersihkan isi sebelumnya

    console.log('Rendering portofolios...');

    if (portos.length === 0) {
        portfolioList.innerHTML = '<p>Tidak ada portofolio tersedia.</p>';
        return;
    }

    portos.forEach((porto) => {
        console.log('Menambahkan elemen porto dengan type:', porto.type); // Log untuk memeriksa tipe

        const portoElement = document.createElement('div');
        portoElement.classList.add('col-lg-4', 'col-md-6', 'all', porto.type || 'uncategorized');
        
        portoElement.innerHTML = `
            <div class="portfolio_box">
                <div class="single_portfolio">
                    <img class="img-fluid w-100" src="${porto.imageUrl || 'img/default.jpg'}" alt="">
                    <div class="overlay"></div>
                    <a href="${porto.imageUrl || 'img/default.jpg'}" class="img-gal">
                        <div class="icon">
                            <span class="lnr lnr-cross"></span>
                        </div>
                    </a>
                </div>
                <div class="short_info">
                    <h4><a href="portfolio-details.html?id=${porto.id}">${porto.title}</a></h4>
                    <p>${porto.keyword || 'Uncategorized'}</p>
                </div>
            </div>
        `;

        portfolioList.appendChild(portoElement);
    });

    console.log('Portofolios berhasil dirender, memulai Isotope...');
        initIsotope();
    }

    

    
    