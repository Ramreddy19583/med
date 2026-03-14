let totalBeds = 50
let occupiedBeds = 20

function generateBill() {

    let room = Number(document.getElementById("roomCharge").value) || 0
    let doctor = Number(document.getElementById("doctorFee").value) || 0
    let medicine = Number(document.getElementById("medicineCharge").value) || 0
    let lab = Number(document.getElementById("labCharge").value) || 0
    let nursing = Number(document.getElementById("nursingCharge").value) || 0
    let operation = Number(document.getElementById("operationCharge").value) || 0

    let total = room + doctor + medicine + lab + nursing + operation

    document.getElementById("billResult").innerHTML =
        "<b>Total Bill: ₹ " + total + "</b>"

}

function downloadBill() {

    const { jsPDF } = window.jspdf

    let name = document.getElementById("billName").value
    let room = document.getElementById("roomCharge").value
    let doctor = document.getElementById("doctorFee").value
    let medicine = document.getElementById("medicineCharge").value
    let lab = document.getElementById("labCharge").value
    let nursing = document.getElementById("nursingCharge").value
    let operation = document.getElementById("operationCharge").value

    let total =
        Number(room) + Number(doctor) + Number(medicine) + Number(lab) + Number(nursing) + Number(operation)

    let doc = new jsPDF()

    doc.setFontSize(18)
    doc.text("MedCare Hospital Bill", 20, 20)

    doc.setFontSize(12)
    doc.text("Patient Name: " + name, 20, 40)

    doc.text("Room Charge: ₹" + room, 20, 60)
    doc.text("Doctor Fee: ₹" + doctor, 20, 70)
    doc.text("Medicine Charge: ₹" + medicine, 20, 80)
    doc.text("Lab Test Charge: ₹" + lab, 20, 90)
    doc.text("Nursing Charge: ₹" + nursing, 20, 100)
    doc.text("Operation Charge: ₹" + operation, 20, 110)

    doc.text("Total Bill: ₹" + total, 20, 130)

    doc.save("MedCare_Bill.pdf")

}

function dischargePatient() {

    if (occupiedBeds > 0) {

        occupiedBeds--

        alert("Patient Discharged. Bed Available Increased.")

    }

}
