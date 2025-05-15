document.addEventListener('DOMContentLoaded', () => {
    const coursesDataUrl = 'js/data/courses.json';
    let allCoursesData = []; // To store fetched course data globally for this session

    const featuredCoursesGrid = document.getElementById('featured-courses-grid');
    const allCoursesGrid = document.getElementById('all-courses-grid');
    const courseDetailContent = document.querySelector('.course-content');
    const enrolledCoursesGrid = document.getElementById('enrolled-courses-grid');
    const navLinksContainer = document.getElementById('nav-links');

    updateNavigation(); // Update nav on every page load

    async function fetchCourses(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            allCoursesData = await response.json();
            return allCoursesData;
        } catch (error) {
            console.error("Could not fetch courses:", error);
            return [];
        }
    }

    function displayCourses(coursesToDisplay, container, isEnrolledList = false) {
        if (!container) return;
        container.innerHTML = '';

        if (coursesToDisplay.length === 0 && isEnrolledList) {
             const noCoursesMsg = document.getElementById('no-courses-message');
             if(noCoursesMsg) noCoursesMsg.style.display = 'block';
             return;
        } else if (coursesToDisplay.length === 0) {
            container.innerHTML = '<p>No courses found matching your criteria.</p>';
            return;
        }
        if (isEnrolledList) {
            const noCoursesMsg = document.getElementById('no-courses-message');
            if(noCoursesMsg) noCoursesMsg.style.display = 'none';
        }


        coursesToDisplay.forEach(course => {
            const courseCard = `
                <article class="course-card">
                    <img src="${course.imageUrl || 'images/placeholder.jpg'}" alt="${course.title}" onerror="this.onerror=null;this.src='images/placeholder.jpg';">
                    <h3>${course.title}</h3>
                    <p class="instructor">By: ${course.instructor}</p>
                    <p class="category">${course.category}</p>
                    <p class="price">${course.price}</p>
                    <a href="course-detail.html?id=${course.id}" class="btn-primary">View Details</a>
                    ${isEnrolledList ? `<button class="btn-secondary unenroll-btn" data-course-id="${course.id}">Unenroll</button>` : ''}
                </article>
            `;
            container.innerHTML += courseCard;
        });

        if (isEnrolledList) {
            addUnenrollEventListeners();
        }
    }

    async function displayCourseDetail() {
        if (!courseDetailContent) return;
        if (allCoursesData.length === 0) allCoursesData = await fetchCourses(coursesDataUrl);


        const urlParams = new URLSearchParams(window.location.search);
        const courseId = parseInt(urlParams.get('id'));
        const course = allCoursesData.find(c => c.id === courseId);

        if (course) {
            document.getElementById('course-page-title').textContent = `${course.title} - LearnSphere`;
            const courseImage = document.getElementById('course-image');
            courseImage.src = course.imageUrl || 'images/placeholder.jpg';
            courseImage.alt = course.title;
            courseImage.onerror = () => { courseImage.src = 'images/placeholder.jpg'; }; // Fallback for broken image links

            document.getElementById('course-title').textContent = course.title;
            document.getElementById('course-instructor').textContent = course.instructor;
            document.getElementById('course-category').textContent = course.category;
            document.getElementById('course-difficulty').textContent = course.difficulty;
            document.getElementById('course-price').textContent = course.price;
            document.getElementById('course-description').textContent = course.description;

            const curriculumList = document.getElementById('course-curriculum');
            curriculumList.innerHTML = '';
            course.modules.forEach(module => {
                const li = document.createElement('li');
                li.textContent = module;
                curriculumList.appendChild(li);
            });

            const enrollButton = document.getElementById('enroll-button');
            if (enrollButton) {
                if (window.auth.isLoggedIn()) {
                    const enrolledCourses = getEnrolledCourses();
                    if (enrolledCourses.includes(courseId)) {
                        enrollButton.textContent = 'Already Enrolled';
                        enrollButton.disabled = true;
                        enrollButton.classList.add('btn-secondary');
                        enrollButton.classList.remove('btn-primary');
                    } else {
                        enrollButton.textContent = 'Enroll Now';
                        enrollButton.disabled = false;
                        enrollButton.classList.remove('btn-secondary');
                        enrollButton.classList.add('btn-primary');
                        enrollButton.onclick = () => enrollInCourse(courseId, course.title);
                    }
                } else {
                    enrollButton.textContent = 'Login to Enroll';
                    enrollButton.onclick = () => window.location.href = 'login.html';
                }
            }

            // Display reviews (simplified - stored with course in JSON for now)
            const reviewsDiv = document.getElementById('course-reviews');
            reviewsDiv.innerHTML = '<h3>Student Reviews</h3>';
            if (course.reviews && course.reviews.length > 0) {
                course.reviews.forEach(review => {
                    reviewsDiv.innerHTML += `
                        <div class="review">
                            <strong>${review.user} (${review.rating}/5):</strong>
                            <p>${review.comment}</p>
                        </div>`;
                });
            } else {
                reviewsDiv.innerHTML += '<p>No reviews yet.</p>';
            }
            // TODO: Add a form to submit reviews (stores to localStorage)

        } else {
            courseDetailContent.innerHTML = '<p>Course not found.</p>';
        }
    }

    function enrollInCourse(courseId, courseTitle) {
        if (!window.auth.isLoggedIn()) {
            alert('Please login to enroll in courses.');
            window.location.href = 'login.html';
            return;
        }
        let enrolled = getEnrolledCourses();
        if (!enrolled.includes(courseId)) {
            enrolled.push(courseId);
            localStorage.setItem('learnsphere_enrolledCourses', JSON.stringify(enrolled));
            alert(`Successfully enrolled in ${courseTitle}!`);
            // Update button state on course detail page if currently on it
            if(document.getElementById('enroll-button') && parseInt(new URLSearchParams(window.location.search).get('id')) === courseId) {
                const enrollButton = document.getElementById('enroll-button');
                enrollButton.textContent = 'Already Enrolled';
                enrollButton.disabled = true;
                enrollButton.classList.add('btn-secondary');
                enrollButton.classList.remove('btn-primary');
            }
        } else {
            alert(`You are already enrolled in ${courseTitle}.`);
        }
    }
    
    function unenrollFromCourse(courseId) {
        if (!window.auth.isLoggedIn()) return; // Should not happen if button is shown
        let enrolled = getEnrolledCourses();
        const index = enrolled.indexOf(courseId);
        if (index > -1) {
            enrolled.splice(index, 1);
            localStorage.setItem('learnsphere_enrolledCourses', JSON.stringify(enrolled));
            alert('Unenrolled successfully.');
            // Refresh the dashboard view
            if (enrolledCoursesGrid) {
                 loadEnrolledCourses();
            }
        }
    }

    function getEnrolledCourses() {
        // For simplicity, all users share the same enrolled list in this basic example.
        // To make it user-specific without a backend, you'd need to key localStorage by username.
        // e.g., localStorage.getItem(`learnsphere_enrolled_${currentUser.username}`)
        return JSON.parse(localStorage.getItem('learnsphere_enrolledCourses')) || [];
    }

    async function loadEnrolledCourses() {
        if (!enrolledCoursesGrid) return;
        if (!window.auth.isLoggedIn()) {
            enrolledCoursesGrid.innerHTML = "<p>Please <a href='login.html'>login</a> to see your enrolled courses.</p>";
            return;
        }

        if (allCoursesData.length === 0) allCoursesData = await fetchCourses(coursesDataUrl);
        
        const enrolledIds = getEnrolledCourses();
        const coursesToDisplay = allCoursesData.filter(course => enrolledIds.includes(course.id));
        
        displayCourses(coursesToDisplay, enrolledCoursesGrid, true);
    }
    
    function addUnenrollEventListeners() {
        document.querySelectorAll('.unenroll-btn').forEach(button => {
            button.addEventListener('click', function() {
                const courseId = parseInt(this.dataset.courseId);
                unenrollFromCourse(courseId);
            });
        });
    }


    function updateNavigation() {
        if (!navLinksContainer) return;
        const baseNav = `
            <li><a href="index.html">Home</a></li>
            <li><a href="courses.html">Courses</a></li>
        `;
        let authNav = '';
        if (window.auth && window.auth.isLoggedIn()) {
            const user = window.auth.getCurrentUser();
            authNav = `
                <li><a href="dashboard.html">Dashboard (${user.username})</a></li>
                <li><a href="#" id="logout-link">Logout</a></li>
            `;
        } else {
            authNav = `
                <li><a href="login.html">Login</a></li>
                <li><a href="register.html">Register</a></li>
            `;
        }
        navLinksContainer.innerHTML = baseNav + authNav;

        // Add active class to current page link
        const currentPage = window.location.pathname.split("/").pop() || "index.html";
        navLinksContainer.querySelectorAll('a').forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });


        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.auth.logoutUser();
            });
        }
    }


    async function initPage() {
        await fetchCourses(coursesDataUrl); // Fetch all courses once

        if (featuredCoursesGrid) {
            displayCourses(allCoursesData.slice(0, 3), featuredCoursesGrid);
        }
        if (allCoursesGrid) {
            displayCourses(allCoursesData, allCoursesGrid);
            const categoryFilter = document.getElementById('category-filter');
            const searchFilter = document.getElementById('search-filter');

            function applyFilters() {
                const category = categoryFilter ? categoryFilter.value : 'all';
                const searchTerm = searchFilter ? searchFilter.value.toLowerCase() : '';
                
                let filteredCourses = allCoursesData;

                if (category !== 'all') {
                    filteredCourses = filteredCourses.filter(course => course.category === category);
                }
                if (searchTerm) {
                    filteredCourses = filteredCourses.filter(course => 
                        course.title.toLowerCase().includes(searchTerm) ||
                        (course.description && course.description.toLowerCase().includes(searchTerm))
                    );
                }
                displayCourses(filteredCourses, allCoursesGrid);
            }

            if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
            if (searchFilter) searchFilter.addEventListener('input', applyFilters);
        }
        if (courseDetailContent) {
            displayCourseDetail();
        }
        if (enrolledCoursesGrid) {
            loadEnrolledCourses();
        }
    }

    initPage();
});
