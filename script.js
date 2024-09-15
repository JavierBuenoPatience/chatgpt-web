(function() {
    // Encapsulamos el código en una función autoejecutable para evitar variables globales

    const adminEmail = 'javibueda@gmail.com'; // Correo del administrador
    let users = {};
    let currentUser = null;

    // Manejo seguro de la obtención de usuarios desde localStorage
    try {
        users = JSON.parse(localStorage.getItem('users')) || {};
    } catch (e) {
        console.error('Error al parsear los usuarios del localStorage', e);
        localStorage.removeItem('users');
    }

    document.addEventListener('DOMContentLoaded', () => {
        const profileIcon = document.getElementById('profile-icon');
        const dropdown = document.getElementById('profile-dropdown');
        const menu = document.getElementById('menu-desplegable');
        const headerRight = document.getElementById('header-right');

        // Mostrar u ocultar el menú desplegable del perfil
        if (profileIcon && dropdown) {
            profileIcon.addEventListener('click', (event) => {
                event.stopPropagation();
                dropdown.classList.toggle('show-dropdown');
            });

            // Cerrar el dropdown si se hace clic fuera de él
            document.addEventListener('click', (event) => {
                if (!profileIcon.contains(event.target) && !dropdown.contains(event.target)) {
                    dropdown.classList.remove('show-dropdown');
                }
            });
        }

        // Verificar si el usuario ha iniciado sesión
        if (localStorage.getItem('loggedIn') === 'true') {
            currentUser = users[localStorage.getItem('email')];
            if (currentUser) {
                showHomeScreen();
                if (menu) menu.style.display = 'block';
                checkIfPasswordNeedsChange(); // Verificar si necesita cambiar contraseña temporal
            } else {
                // Si el usuario no se encuentra, cerrar sesión
                handleLogout();
            }
        } else {
            showLoginScreen();
            if (menu) menu.style.display = 'none';
        }

        // Añadir event listeners a headerRight si existe
        if (headerRight) {
            headerRight.addEventListener('click', () => {
                if (dropdown) {
                    dropdown.classList.toggle('show-dropdown');
                }
            });

            document.addEventListener('click', (event) => {
                if (!headerRight.contains(event.target) && !dropdown.contains(event.target)) {
                    if (dropdown) {
                        dropdown.classList.remove('show-dropdown');
                    }
                }
            });
        }

        // Manejo de la subida de documentos
        const uploadDocumentElement = document.getElementById('upload-document');
        if (uploadDocumentElement) {
            uploadDocumentElement.addEventListener('change', uploadDocuments);
        }

        // Mostrar botón de administración si el usuario es el administrador
        const adminButton = document.getElementById('admin-panel-button');
        if (adminButton) {
            adminButton.addEventListener('click', showAdminPanel);
        }

        // Actualizar la lista de usuarios al cargar la pantalla de administración
        updateUserList();

        // Event listeners adicionales
        const logo = document.getElementById('logo');
        if (logo) {
            logo.addEventListener('click', handleLogoClick);
        }

        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', handleProfileUpdate);
        }

        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }

        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', handleLogout);
        }

        const createUserForm = document.getElementById('create-user-form');
        if (createUserForm) {
            createUserForm.addEventListener('submit', createNewUser);
        }

        const profileImageInput = document.getElementById('profile-image-input');
        if (profileImageInput) {
            profileImageInput.addEventListener('change', handleImageUpload);
        }

        // Añade aquí otros event listeners necesarios para tus funcionalidades
    });

    // Función para redirigir al registro en Typeform
    function redirectToTypeform() {
        window.location.href = "https://qz232a8zljw.typeform.com/to/AHskzuV5?typeform-source=javierbuenopatience.github.io";
    }

    function handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (users[email] && verifyPassword(password, users[email].password)) {
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('email', email);
            currentUser = users[email];
            showHomeScreen();
            const menu = document.getElementById('menu-desplegable');
            if (menu) menu.style.display = 'block';
            checkIfPasswordNeedsChange();
        } else {
            alert('Correo o contraseña incorrectos.');
        }
    }

    function checkIfPasswordNeedsChange() {
        if (currentUser && currentUser.temporaryPassword) {
            const passwordChangePopup = document.getElementById('password-change-popup');
            if (passwordChangePopup) {
                passwordChangePopup.style.display = 'block';
            }
        }
    }

    function handleFirstPasswordChange(event) {
        event.preventDefault();
        const newPassword = document.getElementById('new-password').value;

        if (currentUser) {
            currentUser.password = hashPassword(newPassword);
            delete currentUser.temporaryPassword;
            localStorage.setItem('users', JSON.stringify(users));
            alert('Contraseña cambiada con éxito.');
            const passwordChangePopup = document.getElementById('password-change-popup');
            if (passwordChangePopup) {
                passwordChangePopup.style.display = 'none';
            }
        }
    }

    function handleLogout() {
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('email');
        currentUser = null;
        hideAllScreens();
        showLoginScreen();
    }

    function handleProfileUpdate(event) {
        event.preventDefault();
        const email = localStorage.getItem('email');
        const profileImgElement = document.getElementById('profile-img');
        const profile = {
            fullName: document.getElementById('full-name').value,
            phone: document.getElementById('phone').value,
            studyTime: document.getElementById('study-time').value,
            specialty: document.getElementById('specialty').value,
            hobbies: document.getElementById('hobbies').value,
            location: document.getElementById('location').value,
            profileImage: profileImgElement ? profileImgElement.src : 'assets/default-profile.png'
        };
        if (users[email]) {
            users[email].profile = profile;
            localStorage.setItem('users', JSON.stringify(users));
            alert('Perfil actualizado con éxito');
            updateProfileIcon();
        } else {
            alert('Usuario no encontrado.');
        }
    }

    function validateEmail(email) {
        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        const hotmailRegex = /^[a-zA-Z0-9._%+-]+@hotmail\.com$/;
        return gmailRegex.test(email) || hotmailRegex.test(email);
    }

    function showLoginScreen() {
        hideAllScreens();
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) loginScreen.style.display = 'block';
        const header = document.querySelector('header');
        const footer = document.querySelector('footer');
        if (header) header.style.display = 'none';
        if (footer) footer.style.display = 'none';
    }

    function showHomeScreen() {
        if (localStorage.getItem('loggedIn') === 'true') {
            hideAllScreens();
            const homeScreen = document.getElementById('home-screen');
            if (homeScreen) homeScreen.style.display = 'block';
            const userNameHome = document.getElementById('user-name-home');
            if (userNameHome) userNameHome.textContent = localStorage.getItem('name');
            const header = document.querySelector('header');
            const footer = document.querySelector('footer');
            if (header) header.style.display = 'flex';
            if (footer) footer.style.display = 'block';
            updateProfileIcon();
            updateDocumentOverview();
        } else {
            showLoginScreen();
        }
    }

    function showAdminPanel() {
        if (localStorage.getItem('email') === adminEmail) {
            hideAllScreens();
            const adminPanel = document.getElementById('admin-panel');
            if (adminPanel) adminPanel.style.display = 'block';
            updateUserList();
        } else {
            alert('No tienes permiso para acceder a esta página.');
        }
    }

    function createNewUser(event) {
        event.preventDefault();

        const newUserEmail = document.getElementById('new-user-email').value;
        const newUserName = document.getElementById('new-user-name').value;
        const newUserPassword = document.getElementById('new-user-password').value;

        if (!newUserEmail || !newUserName || !newUserPassword) {
            alert('Por favor, completa todos los campos.');
            return;
        }

        if (users[newUserEmail]) {
            alert('El correo ya está registrado.');
            return;
        }

        users[newUserEmail] = {
            name: newUserName,
            password: hashPassword(newUserPassword),
            profile: {},
            documents: [],
            folders: [],
            temporaryPassword: true,
            registeredAt: new Date().toISOString()
        };

        localStorage.setItem('users', JSON.stringify(users));
        const createUserForm = document.getElementById('create-user-form');
        if (createUserForm) createUserForm.reset();
        alert('Usuario creado con éxito.');
        updateUserList();
    }

    function updateUserList() {
        const userListContainer = document.getElementById('user-list');
        if (userListContainer) {
            userListContainer.innerHTML = '';

            Object.keys(users).forEach(email => {
                const user = users[email];
                const userItem = document.createElement('div');
                userItem.classList.add('user-item');
                userItem.innerHTML = `
                    <strong>Nombre:</strong> ${user.name || 'N/A'}<br>
                    <strong>Email:</strong> ${email}<br>
                    <strong>Registrado:</strong> ${user.registeredAt ? new Date(user.registeredAt).toLocaleDateString() : 'N/A'}
                `;
                userListContainer.appendChild(userItem);
            });
        }
    }

    function showProfile() {
        if (localStorage.getItem('loggedIn') === 'true') {
            hideAllScreens();
            const profileScreen = document.getElementById('profile-screen');
            if (profileScreen) profileScreen.style.display = 'block';
            const email = localStorage.getItem('email');
            const profile = users[email].profile || {};
            document.getElementById('full-name').value = profile.fullName || '';
            document.getElementById('phone').value = profile.phone || '';
            document.getElementById('study-time').value = profile.studyTime || '';
            document.getElementById('specialty').value = profile.specialty || '';
            document.getElementById('hobbies').value = profile.hobbies || '';
            document.getElementById('location').value = profile.location || '';
            const profileImg = document.getElementById('profile-img');
            if (profileImg) profileImg.src = profile.profileImage || 'assets/default-profile.png';
        } else {
            showLoginScreen();
        }
    }

    function showGroups() {
        if (localStorage.getItem('loggedIn') === 'true') {
            hideAllScreens();
            const groupsScreen = document.getElementById('groups-screen');
            if (groupsScreen) groupsScreen.style.display = 'block';
        } else {
            showLoginScreen();
        }
    }

    function showIASpecializedOptions() {
        if (localStorage.getItem('loggedIn') === 'true') {
            hideAllScreens();
            const iaSpecializedScreen = document.getElementById('ia-specialized-screen');
            if (iaSpecializedScreen) iaSpecializedScreen.style.display = 'block';
        } else {
            showLoginScreen();
        }
    }

    function redirectToIA(specialty) {
        if (specialty === 'biologia') {
            window.open('https://chatgpt.com/g/g-xgl7diXqb-patience-biologia-y-geologia', '_blank');
        } else {
            alert('La especialidad seleccionada estará disponible pronto.');
        }
    }

    function showTraining() {
        if (localStorage.getItem('loggedIn') === 'true') {
            hideAllScreens();
            const trainingScreen = document.getElementById('training-screen');
            if (trainingScreen) trainingScreen.style.display = 'block';
        } else {
            showLoginScreen();
        }
    }

    function showComingSoon() {
        if (localStorage.getItem('loggedIn') === 'true') {
            hideAllScreens();
            const comingSoonScreen = document.getElementById('coming-soon-screen');
            if (comingSoonScreen) comingSoonScreen.style.display = 'block';
        } else {
            showLoginScreen();
        }
    }

    function showNews() {
        if (localStorage.getItem('loggedIn') === 'true') {
            hideAllScreens();
            const newsScreen = document.getElementById('news-screen');
            if (newsScreen) newsScreen.style.display = 'block';
        } else {
            showLoginScreen();
        }
    }

    function showDocuments() {
        if (localStorage.getItem('loggedIn') === 'true') {
            hideAllScreens();
            const documentsScreen = document.getElementById('documents-screen');
            if (documentsScreen) documentsScreen.style.display = 'block';
            displayDocuments();
        } else {
            showLoginScreen();
        }
    }

    function showGuide() {
        if (localStorage.getItem('loggedIn') === 'true') {
            hideAllScreens();
            const guideScreen = document.getElementById('guide-screen');
            if (guideScreen) guideScreen.style.display = 'block';
        } else {
            showLoginScreen();
        }
    }

    function showDirectory() {
        if (localStorage.getItem('loggedIn') === 'true') {
            hideAllScreens();
            const directoryScreen = document.getElementById('directory-screen');
            if (directoryScreen) directoryScreen.style.display = 'block';
        } else {
            showLoginScreen();
        }
    }

    function hideAllScreens() {
        const screens = document.querySelectorAll('.card');
        screens.forEach(screen => screen.style.display = 'none');
    }

    function redirectToURL(url) {
        if (localStorage.getItem('loggedIn') === 'true') {
            window.open(url, '_blank');
        } else {
            alert('Por favor, inicia sesión para acceder a esta funcionalidad.');
            showLoginScreen();
        }
    }

    function handleLogoClick() {
        if (localStorage.getItem('loggedIn') === 'true') {
            showHomeScreen();
        } else {
            showLoginScreen();
        }
    }

    function handleImageUpload(event) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const profileImg = document.getElementById('profile-img');
            if (profileImg) {
                profileImg.src = e.target.result;
            }
        };
        reader.readAsDataURL(event.target.files[0]);
    }

    function updateProfileIcon() {
        const email = localStorage.getItem('email');
        const profile = users[email].profile || {};
        const profileIcon = document.getElementById('profile-icon');
        if (profileIcon) {
            profileIcon.src = profile.profileImage || 'assets/default-profile.png';
        }
    }

    function showNewsContent(newsType) {
        const csifIframe = document.getElementById('csif-iframe');
        const sipriIframe = document.getElementById('sipri-iframe');

        if (csifIframe) csifIframe.style.display = 'none';
        if (sipriIframe) sipriIframe.style.display = 'none';

        if (newsType === 'csif' && csifIframe) {
            csifIframe.style.display = 'block';
        } else if (newsType === 'sipri' && sipriIframe) {
            sipriIframe.style.display = 'block';
        }
    }

    function showHelp() {
        if (localStorage.getItem('loggedIn') === 'true') {
            hideAllScreens();
            const helpScreen = document.getElementById('help-screen');
            if (helpScreen) helpScreen.style.display = 'block';
        } else {
            showLoginScreen();
        }
    }

    function toggleSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = section.style.display === 'none' || section.style.display === '' ? 'block' : 'none';
        }
    }

    function updateDocumentOverview() {
        const email = localStorage.getItem('email');
        const userDocuments = users[email]?.documents || [];

        const documentList = document.getElementById('document-list');
        if (documentList) {
            documentList.innerHTML = '';

            if (userDocuments.length === 0) {
                documentList.textContent = 'Sin documentos';
            } else {
                const lastOpenedDocuments = userDocuments.slice(-2);
                lastOpenedDocuments.forEach(doc => {
                    const docElement = document.createElement('p');
                    docElement.textContent = doc.name;
                    documentList.appendChild(docElement);
                });
            }
        }
    }

    // Función que abre el documento en una nueva pestaña utilizando su URL base64.
    function openDocument(url) {
        const newWindow = window.open(url, '_blank');
        if (!newWindow) {
            alert('Pop-up bloqueado. Habilita las ventanas emergentes para ver el archivo.');
        }
    }

    function uploadDocuments(event) {
        const email = localStorage.getItem('email');
        const files = event.target.files;

        if (!users[email].documents) {
            users[email].documents = [];
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            reader.onload = function (e) {
                const documentData = {
                    name: file.name,
                    lastOpened: null,
                    folder: null,
                    fileContent: e.target.result // Guardamos el contenido como una URL base64.
                };
                users[email].documents.push(documentData);
                localStorage.setItem('users', JSON.stringify(users));
                displayDocuments();
                updateDocumentOverview();
            };

            reader.readAsDataURL(file); // Leemos el archivo como una Data URL (base64).
        }
    }

    function createFolder() {
        const folderName = prompt('Nombre de la nueva carpeta:');
        if (folderName) {
            const folderData = {
                name: folderName,
                documents: []
            };
            const email = localStorage.getItem('email');
            if (!users[email].folders) {
                users[email].folders = [];
            }
            users[email].folders.push(folderData);
            localStorage.setItem('users', JSON.stringify(users));
            displayDocuments();
        }
    }

    function deleteFolder(folderName) {
        const email = localStorage.getItem('email');
        const folderIndex = users[email].folders.findIndex(folder => folder.name === folderName);
        if (folderIndex > -1) {
            users[email].folders.splice(folderIndex, 1);
            localStorage.setItem('users', JSON.stringify(users));
            displayDocuments();
        }
    }

    function deleteDocument(documentName) {
        const email = localStorage.getItem('email');
        const documentIndex = users[email].documents.findIndex(doc => doc.name === documentName);
        if (documentIndex > -1) {
            users[email].documents.splice(documentIndex, 1);
            localStorage.setItem('users', JSON.stringify(users));
            displayDocuments();
        }
    }

    function displayDocuments() {
        const email = localStorage.getItem('email');
        const documentsContainer = document.getElementById('documents-container');
        if (documentsContainer) {
            documentsContainer.innerHTML = '';

            const userFolders = users[email].folders || [];
            userFolders.forEach(folder => {
                const folderElement = document.createElement('div');
                folderElement.classList.add('folder');
                folderElement.textContent = folder.name;

                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
                deleteButton.onclick = () => deleteFolder(folder.name);

                folderElement.appendChild(deleteButton);
                documentsContainer.appendChild(folderElement);
            });

            const userDocuments = users[email].documents || [];
            userDocuments.forEach(doc => {
                const docElement = document.createElement('div');
                docElement.classList.add('document');
                docElement.textContent = doc.name;
                docElement.addEventListener('click', () => {
                    doc.lastOpened = new Date();
                    localStorage.setItem('users', JSON.stringify(users));
                    openDocument(doc.fileContent); // Usamos el contenido base64 para abrir el documento.
                    updateDocumentOverview();
                });

                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
                deleteButton.onclick = () => deleteDocument(doc.name);

                docElement.appendChild(deleteButton);
                documentsContainer.appendChild(docElement);
            });
        }
    }

    function moveDocumentToFolder(email, documentName) {
        const selectedFolder = prompt('Nombre de la carpeta a la que deseas mover el documento:');
        if (selectedFolder) {
            const folder = users[email].folders.find(f => f.name === selectedFolder);
            if (folder) {
                const documentIndex = users[email].documents.findIndex(doc => doc.name === documentName);
                if (documentIndex > -1) {
                    const document = users[email].documents.splice(documentIndex, 1)[0];
                    folder.documents.push(document);
                    localStorage.setItem('users', JSON.stringify(users));
                    displayDocuments();
                } else {
                    alert('Documento no encontrado.');
                }
            } else {
                alert('Carpeta no encontrada.');
            }
        }
    }

    // Función para hashear contraseñas (ejemplo simplificado, no usar en producción)
    function hashPassword(password) {
        return btoa(password); // Codificación Base64 como placeholder
    }

    function verifyPassword(inputPassword, storedPasswordHash) {
        return hashPassword(inputPassword) === storedPasswordHash;
    }

})();
