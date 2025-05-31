        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
        import { getAuth, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";


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
    
        // Cek status login
        onAuthStateChanged(auth, async (user) => { 
            if (user) {
                document.getElementById("profile-item").style.display = "block";
            } else {
                
            }
        });