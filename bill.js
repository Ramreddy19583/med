bill.js
let billData = null;

function generateBill() {
    const name = document.getElementById('billName').value.trim();
    const room = parseFloat(document.getElementById('roomCharge').value) || 0;
    const doctor = parseFloat(document.getElementById('doctorFee').value) || 0;
    const medicine = parseFloat(document.getElementById('medicineCharge').value) || 0;
    const lab = parseFloat(document.getElementById('labCharge').value) || 0;
    const nursing = parseFloat(document.getElementById('nursingCharge').value) || 0;
    const operation = parseFloat(document.getElementById('operationCharge').value) || 0;

    if (!name) {
        alert('Please enter patient name');
        return;
    }

    const total = room + doctor + medicine + lab + nursing + operation;

    billData = {
        name: name,
        room: room,
        doctor: doctor,
        medicine: medicine,
        lab: lab,
        nursing: nursing,
        operation: operation,
        total: total,
        date: new Date().toLocaleDateString()
    };

    displayBill();
}

function displayBill() {
    if (!billData) return;

    const billHTML = `
                <div class="bill-breakdown">
                    <h3><i class="fa-solid fa-file-invoice"></i> Bill Summary</h3>
                    <div class="bill-item">
                        <span>Patient Name:</span>
                        <strong>${billData.name}</strong>
                    </div>
                    <div class="bill-item">
                        <span>Date:</span>
                        <strong>${billData.date}</strong>
                    </div>
                    <hr style="border: none; border-top: 1px solid #d1d5db; margin: 10px 0;">
                    <div class="bill-item">
                        <span>Room Charge:</span>
                        <strong>₹${billData.room.toFixed(2)}</strong>
                    </div>
                    <div class="bill-item">
                        <span>Doctor Fee:</span>
                        <strong>₹${billData.doctor.toFixed(2)}</strong>
                    </div>
                    <div class="bill-item">
                        <span>Medicine Charge:</span>
                        <strong>₹${billData.medicine.toFixed(2)}</strong>
                    </div>
                    <div class="bill-item">
                        <span>Lab Test Charge:</span>
                        <strong>₹${billData.lab.toFixed(2)}</strong>
                    </div>
                    <div class="bill-item">
                        <span>Nursing Charge:</span>
                        <strong>₹${billData.nursing.toFixed(2)}</strong>
                    </div>
                    <div class="bill-item">
                        <span>Operation Charge:</span>
                        <strong>₹${billData.operation.toFixed(2)}</strong>
                    </div>
                    <div class="bill-total">
                        <span>TOTAL AMOUNT:</span>
                        <span>₹${billData.total.toFixed(2)}</span>
                    </div>
                </div>
            `;

    document.getElementById('billResult').innerHTML = billHTML;
}

function downloadBill() {
    if (!billData) {
        alert('Please generate bill first');
        return;
    }

    let billContent = `
MedCare Hospital - Patient Bill
================================
Patient Name: ${billData.name}
Bill Date: ${billData.date}
================================
Room Charge:        ₹${billData.room.toFixed(2)}
Doctor Fee:         ₹${billData.doctor.toFixed(2)}
Medicine Charge:    ₹${billData.medicine.toFixed(2)}
Lab Test Charge:    ₹${billData.lab.toFixed(2)}
Nursing Charge:     ₹${billData.nursing.toFixed(2)}
Operation Charge:   ₹${billData.operation.toFixed(2)}
================================
TOTAL AMOUNT:       ₹${billData.total.toFixed(2)}
================================
Thank you for trusting MedCare Hospital
            `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(billContent));
    element.setAttribute('download', `Bill_${billData.name}_${billData.date}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    alert('Bill downloaded successfully!');
}

function dischargePatient() {
    if (!billData) {
        alert('Please generate bill first before discharge');
        return;
    }

    if (confirm(`Discharge patient: ${billData.name}?\nTotal Bill Amount: ₹${billData.total.toFixed(2)}`)) {
        // Update bed availability
        if (window.updateBedAvailability) {
            window.updateBedAvailability();
        }

        // Clear form
        document.getElementById('billName').value = '';
        document.getElementById('roomCharge').value = '';
        document.getElementById('doctorFee').value = '';
        document.getElementById('medicineCharge').value = '';
        document.getElementById('labCharge').value = '';
        document.getElementById('nursingCharge').value = '';
        document.getElementById('operationCharge').value = '';
        document.getElementById('billResult').innerHTML = '';

        billData = null;

        alert(`Patient ${billData?.name || 'has been'} discharged successfully!\n\nBed availability has been updated.`);
    }
}