let studentData = [];

// وظيفة لتحميل البيانات من ملف JSON
function loadData() {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            studentData = data;
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

// وظيفة للبحث عن الطالب
function searchStudent() {
    const studentId = document.getElementById('studentId').value;
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = ''; // مسح النتائج السابقة

    const student = studentData.find(s => s.رقم_القيد === studentId);

    if (student) {
        resultDiv.innerHTML = `
            <h2>${student.اسم_الطالب}</h2>
            <p>درجة الحضور: ${student.درجة_الحضور}</p>
            <p>درجة التطبيقات: ${student.درجة_التطبيقات}</p>
            <p>درجة النصفي: ${student.النصفي}</p>
            <p>أعمال السنة: ${student.أعمال_السنة}</p>
        `;
    } else {
        resultDiv.innerHTML = '<p>رقم القيد غير موجود.</p>';
    }
}

// وظيفة لتحميل ملف Excel
function handleFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // تحديث ملف JSON بالبيانات الجديدة
        studentData = jsonData;
        alert('تم تحميل البيانات بنجاح!');
    };

    reader.readAsArrayBuffer(file);
}

// إضافة الأحداث
document.getElementById('searchBtn').addEventListener('click', searchStudent);
document.getElementById('fileInput').addEventListener('change', handleFile);

// تحميل البيانات عند بدء التطبيق
loadData();
