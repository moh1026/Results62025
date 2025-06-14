document.getElementById("searchBtn").onclick = async () => {
    const studentId = document.getElementById("studentId").value;
    const res = await fetch("/api/student/" + studentId);
    const data = await res.json();
    const result = document.getElementById("result");
    if (data.found) {
        result.innerHTML = `<h2>${data.name}</h2>
            <p>عدد الحضور: ${data.attendance}</p>
            <p>عدد الغياب: ${data.absence}</p>
            <p>درجة النصفي: ${data.midterm}</p>
            <p>أعمال السنة: ${data.work}</p>`;
    } else {
        result.textContent = "رقم القيد غير موجود";
    }
};