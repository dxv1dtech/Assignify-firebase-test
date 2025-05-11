// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA5Wy9vcg9ft0f-ABA9-_gELDuzHCjsCyU",
    authDomain: "assignify-c8ca0.firebaseapp.com",
    projectId: "assignify-c8ca0",
    storageBucket: "assignify-c8ca0.firebasestorage.app",
    messagingSenderId: "579040733871",
    appId: "1:579040733871:web:da36004805c3473296c25a",
    measurementId: "G-LJXWRSQ747"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Initialize services
  const auth = firebase.auth();
  const db = firebase.firestore();
  
  // UI Elements
  const authContainer = document.getElementById('auth-container');
  const appContainer = document.getElementById('app-container');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const showSignup = document.getElementById('show-signup');
  const showLogin = document.getElementById('show-login');
  const homeworkInput = document.getElementById('homework-input');
  const addHomeworkButton = document.getElementById('add-homework-button');
  const homeworkItems = document.getElementById('homework-items');
  const logoutButton = document.getElementById('logout-button');
  
  // Toggle between login and signup forms
  showSignup.addEventListener('click', () => {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
  });
  
  showLogin.addEventListener('click', () => {
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
  });
  
  // Sign up functionality
  document.getElementById('signup-button').addEventListener('click', () => {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    auth.createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        console.log('User registered:', userCredential.user);
        document.getElementById('signup-email').value = '';
        document.getElementById('signup-password').value = '';
      })
      .catch(error => {
        console.error('Registration error:', error.message);
        alert('Registration error: ' + error.message);
      });
  });
  
  // Login functionality
  document.getElementById('login-button').addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    auth.signInWithEmailAndPassword(email, password)
      .then(userCredential => {
        console.log('User logged in:', userCredential.user);
        document.getElementById('login-email').value = '';
        document.getElementById('login-password').value = '';
      })
      .catch(error => {
        console.error('Login error:', error.message);
        alert('Login error: ' + error.message);
      });
  });
  
  // Logout functionality
  logoutButton.addEventListener('click', () => {
    auth.signOut()
      .then(() => {
        console.log('User signed out');
      })
      .catch(error => {
        console.error('Logout error:', error.message);
      });
  });
  
  // Add homework functionality
  addHomeworkButton.addEventListener('click', addHomework);
  
  function addHomework() {
    const homeworkTitle = homeworkInput.value.trim();
    if (!homeworkTitle) return;
    
    const user = auth.currentUser;
    if (!user) {
      alert('You must be logged in to add homework');
      return;
    }
    
    // Add homework to Firestore under the current user's collection
    db.collection('users').doc(user.uid).collection('homework').add({
      title: homeworkTitle,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      console.log('Homework added successfully');
      homeworkInput.value = '';
      loadHomework(); // Refresh the homework list
    })
    .catch(error => {
      console.error('Error adding homework:', error);
      alert('Error adding homework: ' + error.message);
    });
  }
  
  // Load homework for the current user
  function loadHomework() {
    const user = auth.currentUser;
    if (!user) return;
    
    homeworkItems.innerHTML = '';
    
    db.collection('users').doc(user.uid).collection('homework')
      .orderBy('createdAt', 'desc')
      .get()
      .then(snapshot => {
        if (snapshot.empty) {
          homeworkItems.innerHTML = '<li>No homework added yet.</li>';
          return;
        }
        
        snapshot.forEach(doc => {
          const homework = doc.data();
          const li = document.createElement('li');
          li.textContent = homework.title;
          
          // Add delete button
          const deleteBtn = document.createElement('button');
          deleteBtn.textContent = 'Delete';
          deleteBtn.classList.add('delete-btn');
          deleteBtn.addEventListener('click', () => {
            deleteHomework(doc.id);
          });
          
          li.appendChild(deleteBtn);
          homeworkItems.appendChild(li);
        });
      })
      .catch(error => {
        console.error('Error loading homework:', error);
        homeworkItems.innerHTML = '<li>Error loading homework.</li>';
      });
  }
  
  // Delete homework item
  function deleteHomework(id) {
    const user = auth.currentUser;
    if (!user) return;
    
    db.collection('users').doc(user.uid).collection('homework').doc(id).delete()
      .then(() => {
        console.log('Homework deleted');
        loadHomework(); // Refresh the list
      })
      .catch(error => {
        console.error('Error deleting homework:', error);
      });
  }
  
  // Auth state changes listener
  auth.onAuthStateChanged(user => {
    if (user) {
      // User is signed in
      authContainer.style.display = 'none';
      appContainer.style.display = 'block';
      loadHomework(); // Load user's homework when they log in
    } else {
      // User is signed out
      authContainer.style.display = 'block';
      appContainer.style.display = 'none';
      homeworkItems.innerHTML = '';
    }
  });