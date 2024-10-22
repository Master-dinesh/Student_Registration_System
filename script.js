const studentForm = document.getElementById('studentForm');
const studentList = document.getElementById('studentList');
const submitButton = document.getElementById('submitButton');
const confirmationDialog = document.getElementById('confirmationDialog');
const confirmButton = document.getElementById('confirmButton');
const cancelButton = document.getElementById('cancelButton');
const deleteConfirmationDialog = document.getElementById('deleteConfirmationDialog');
const deleteConfirmButton = document.getElementById('deleteConfirmButton');
const deleteCancelButton = document.getElementById('deleteCancelButton');

let students = JSON.parse(localStorage.getItem('students')) || [];
let editIndex = -1;
let initialFormValues = {};

// Detect form input changes
function detectFormChanges() {
    const studentName = document.getElementById('studentName');
    const studentID = document.getElementById('studentID');
    const email = document.getElementById('email');
    const contactNumber = document.getElementById('contactNumber');

    studentName.addEventListener('input', () => { updateInitialValues(); });
    studentID.addEventListener('input', () => { updateInitialValues(); });
    email.addEventListener('input', () => { updateInitialValues(); });
    contactNumber.addEventListener('input', () => { updateInitialValues(); });
}

// Update initial values
function updateInitialValues() {
    if (editIndex >= 0) {
        const student = students[editIndex];
        initialFormValues = {
            name: student.name,
            id: student.id,
            email: student.email,
            contact: student.contact,
        };
    }
}

// Display students
function displayStudents() {
    studentList.innerHTML = '';
    students.forEach((student, index) => {
        const studentDiv = document.createElement('div');
        studentDiv.className = 'border p-2 mb-2 bg-gray-50 flex justify-between items-center';
        studentDiv.innerHTML = `
            <div>
                <strong>Name:</strong> ${student.name} <br>
                <strong>ID:</strong> ${student.id} <br>
                <strong>Email:</strong> ${student.email} <br>
                <strong>Contact:</strong> ${student.contact}
            </div>
            <div>
                <button class="text-green-500 mr-2" onclick="editStudent(${index})">Edit</button>
                <button class="text-red-500" onclick="showDeleteConfirmationDialog(${index})">Delete</button>
            </div>
        `;
        studentList.appendChild(studentDiv);
    });
}

// Validate inputs
function validateInput() {
    const studentName = document.getElementById('studentName');
    const studentID = document.getElementById('studentID');
    const email = document.getElementById('email');
    const contactNumber = document.getElementById('contactNumber');
    
    let valid = true;

    // Reset error messages
    document.getElementById('nameError').classList.add('hidden');
    document.getElementById('idError').classList.add('hidden');
    document.getElementById('emailError').classList.add('hidden');
    document.getElementById('contactError').classList.add('hidden');

    // Validate name
    if (!/^[A-Za-z\s]+$/.test(studentName.value)) {
        document.getElementById('nameError').innerText = 'Please enter a valid name (letters only)';
        document.getElementById('nameError').classList.remove('hidden');
        valid = false;
    }

    // Validate student ID
    if (!/^\d+$/.test(studentID.value)) {
        document.getElementById('idError').innerText = 'Student ID must be numeric';
        document.getElementById('idError').classList.remove('hidden');
        valid = false;
    } else if (students.some((student, idx) => student.id === studentID.value && idx !== editIndex)) {
        document.getElementById('idError').innerText = 'Student ID must be unique';
        document.getElementById('idError').classList.remove('hidden');
        valid = false;
    }

    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.value) || !/\@(gmail\.com|outlook\.com)$/.test(email.value)) {
        document.getElementById('emailError').innerText = 'Please enter a valid email address ending with @gmail.com or @outlook.com';
        document.getElementById('emailError').classList.remove('hidden');
        valid = false;
    }

    // Validate contact number
    if (!/^[6789]\d{9}$/.test(contactNumber.value)) {
        document.getElementById('contactError').innerText = 'Contact number must be 10 digits and start with 6, 7, 8, or 9';
        document.getElementById('contactError').classList.remove('hidden');
        valid = false;
    } else if (students.some((student, idx) => student.contact === contactNumber.value && idx !== editIndex)) {
        document.getElementById('contactError').innerText = 'Contact number must be unique';
        document.getElementById('contactError').classList.remove('hidden');
        valid = false;
    }

    return valid;
}

// Handle form submission
studentForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (validateInput()) {
        if (editIndex === -1) {
            // New student data
            const studentData = {
                name: document.getElementById('studentName').value,
                id: document.getElementById('studentID').value,
                email: document.getElementById('email').value,
                contact: document.getElementById('contactNumber').value,
            };
            students.push(studentData);
            localStorage.setItem('students', JSON.stringify(students));
            studentForm.reset();
            displayStudents();
        } else {
            // Show confirmation dialog for modifications
            confirmationDialog.classList.remove('hidden'); // Show dialog box

            confirmButton.onclick = () => {
                // Check if the values have changed before modifying
                if (JSON.stringify(initialFormValues) !== JSON.stringify({
                    name: document.getElementById('studentName').value,
                    id: document.getElementById('studentID').value,
                    email: document.getElementById('email').value,
                    contact: document.getElementById('contactNumber').value,
                })) {
                    const studentData = {
                        name: document.getElementById('studentName').value,
                        id: document.getElementById('studentID').value,
                        email: document.getElementById('email').value,
                        contact: document.getElementById('contactNumber').value,
                    };
                    students[editIndex] = studentData;
                    localStorage.setItem('students', JSON.stringify(students));
                    displayStudents();
                    studentForm.reset();
                } else {
                    alert("No changes made. Please modify before saving.");
                }
                confirmationDialog.classList.add('hidden'); // Hide dialog box
                editIndex = -1; // Reset edit index
            };

            cancelButton.onclick = () => {
                confirmationDialog.classList.add('hidden'); // Hide dialog box without modifying
            };
        }
        updateSubmitButton(); // Update the submit button text
    }
});

// Show confirmation dialog for deletion
function showDeleteConfirmationDialog(index) {
    deleteConfirmationDialog.classList.remove('hidden'); // Show delete confirmation dialog
    deleteConfirmButton.onclick = () => {
        students.splice(index, 1);
        localStorage.setItem('students', JSON.stringify(students));
        displayStudents();
        deleteConfirmationDialog.classList.add('hidden'); // Hide delete confirmation dialog
    };
    deleteCancelButton.onclick = () => {
        deleteConfirmationDialog.classList.add('hidden'); // Hide delete confirmation dialog
    };
}

// Edit student
function editStudent(index) {
    const student = students[index];
    document.getElementById('studentName').value = student.name;
    document.getElementById('studentID').value = student.id;
    document.getElementById('email').value = student.email;
    document.getElementById('contactNumber').value = student.contact;
    
    editIndex = index; // Set the edit index
    updateInitialValues(); // Store initial values for comparison
    detectFormChanges(); // Start tracking form changes

    // Highlight the edited student in green
    const studentDivs = studentList.children;
    for (let i = 0; i < studentDivs.length; i++) {
        if (i === index) {
            studentDivs[i].classList.add('bg-green-100');
        } else {
            studentDivs[i].classList.remove('bg-green-100');
        }
    }
    updateSubmitButton(); // Update the submit button text for modification
}

// Update the submit button text
function updateSubmitButton() {
    if (editIndex === -1) {
        submitButton.innerText = 'Add Student';
    } else {
        submitButton.innerText = 'Update Student';
    }
}

// Initial display of students
displayStudents();
