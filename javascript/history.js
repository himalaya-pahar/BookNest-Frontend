document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const ongoingBody = document.getElementById("ongoing-body");
  const completedBody = document.getElementById("completed-body");

  async function loadHistory() {
    const res = await fetch("https://booknest-backend-fastapi-1.onrender.com/booklog/history/all", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    ongoingBody.innerHTML = "";
    completedBody.innerHTML = "";

    data.forEach((req) => {
      if (req.status === "completed") {
        completedBody.innerHTML += `<tr>
                <td>${new Date(req.date).toLocaleDateString()}</td>
                <td>${req.role === "owner" ? req.wanted_book_title : req.offered_book_title}</td>
                <td>${req.role === "owner" ? req.offered_book_title : req.wanted_book_title}</td>
                <td>${req.other_person_name}</td>
                <td class="status-completed">Completed</td>
            </tr>`;
      } else if (req.status !== "rejected") {
        const row = document.createElement("tr");
        let actionHtml = "";

        if (req.status === "pending") {
          if (req.role === "owner") {
            actionHtml = `
                        <button class="btn btn-sm btn-primary" onclick="updateReq(${req.id}, 'accepted')">Accept</button>
                        <button class="btn btn-sm btn-danger" onclick="updateReq(${req.id}, 'rejected')">Reject</button>`;
          } else {
            actionHtml = `<span class="status-pending">Waiting for Owner</span>`;
          }
        } else if (req.status === "accepted") {
          // Check if THIS specific user has already clicked confirm
          const hasIConfirmed =
            (req.role === "owner" && req.grantor_confirmed) ||
            (req.role === "requestor" && req.requestor_confirmed);

          actionHtml = `
                    <button class="btn btn-sm btn-outline" onclick="openContactModal(${req.id}, '${req.other_person_name}', '${req.other_person_contact.phone}', '${req.other_person_contact.address}', ${hasIConfirmed})">
                        ${hasIConfirmed ? "View Contact" : "Connect & Confirm"}
                    </button>`;
        }

        row.innerHTML = `
                <td><small>${req.role.toUpperCase()}</small></td>
                <td>${req.role === "owner" ? req.wanted_book_title : req.offered_book_title}</td>
                <td>${req.role === "owner" ? req.offered_book_title : req.wanted_book_title}</td>
                <td>${req.other_person_name}</td>
                <td><strong>${req.status.toUpperCase()}</strong></td>
                <td>${actionHtml}</td>
            `;
        ongoingBody.appendChild(row);
      }
    });
  }
  let activeRequestId = null;

  window.openContactModal = (reqId, name, phone, addr, hasConfirmed) => {
    activeRequestId = reqId;
    document.getElementById("contact-name").innerText = `Meet with ${name}`;
    document.getElementById("contact-phone").innerText = phone;
    document.getElementById("contact-address").innerText = addr;

    const confirmBtn = document.getElementById("modal-confirm-swap");
    if (hasConfirmed) {
      confirmBtn.innerText = "Waiting for other person...";
      confirmBtn.disabled = true;
      confirmBtn.style.opacity = "0.5";
    } else {
      confirmBtn.innerText = "I have received my book";
      confirmBtn.disabled = false;
      confirmBtn.style.opacity = "1";
    }

    document.getElementById("contact-modal").style.display = "flex";
  };

  // This function is called from BOTH the table (Accept/Reject) and the Modal (Confirm)
  window.updateReq = async (id, status) => {
    const res = await fetch(
      `https://booknest-backend-fastapi-1.onrender.com/booklog/request/${id}?upd=${status}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (res.ok) {
      document.getElementById("contact-modal").style.display = "none";
      loadHistory();
    }
  };

  // Wire up the button inside the modal
  document
    .getElementById("modal-confirm-swap")
    .addEventListener("click", () => {
      updateReq(activeRequestId, "completed");
    });

  // Show Contact Modal
  window.showContact = (name, phone, addr) => {
    document.getElementById("contact-name").innerText = `Contact ${name}`;
    document.getElementById("contact-phone").innerText = phone;
    document.getElementById("contact-address").innerText = addr;
    document.getElementById("contact-modal").style.display = "flex";
  };

  document.getElementById("close-contact").onclick = () =>
    (document.getElementById("contact-modal").style.display = "none");

  loadHistory();
});
