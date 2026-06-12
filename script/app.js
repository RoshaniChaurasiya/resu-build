const preview = document.getElementById("preview");

// 1. DATA STATE ENGINE (LOAD FROM LOCAL STORAGE IF IT EXISTS, OTHERWISE EMPTY)
const savedData = localStorage.getItem("resubuild-user-data");
const resume = savedData ? JSON.parse(savedData) : {
  personal: { name: "", title: "", email: "", phone: "", location: "", portfolio: "", linkedin: "" },
  summary: "",
  skills: [],
  languages: [],
  experience: [],
  education: [],
  projects: []
};

const cleanUrl = (url) => url ? url.replace(/^(https?:\/\/)?(www\.)?/, "") : "";

// 2. CENTRAL RENDER PIPELINE
function render() {
  // Save to local storage automatically every single time a character is typed or a change happens
  localStorage.setItem("resubuild-user-data", JSON.stringify(resume));

  preview.innerHTML = `
    <div class="preview-header">
      <h1 class="preview-name">${resume.personal.name || "BUILD YOUR RESUME"}</h1>
      <div class="preview-title">${resume.personal.title}</div>
      <div class="preview-meta">
        ${resume.personal.email ? `<span>✉ ${resume.personal.email}</span>` : ""}
        ${resume.personal.phone ? `<span>📞 ${resume.personal.phone}</span>` : ""}
        ${resume.personal.location ? `<span>📍 ${resume.personal.location}</span>` : ""}
        ${resume.personal.portfolio ? `<span>🌐 <a href="${resume.personal.portfolio.startsWith('http') ? resume.personal.portfolio : 'https://' + resume.personal.portfolio}" target="_blank">${cleanUrl(resume.personal.portfolio)}</a></span>` : ""}
        
        ${resume.personal.linkedin ? `<span>💼 <a href="${resume.personal.linkedin.startsWith('http') ? resume.personal.linkedin : 'https://' + resume.personal.linkedin}" target="_blank">${cleanUrl(resume.personal.linkedin)}</a></span>` : ""}
      </div>
    </div>

    ${resume.summary ? `<div class="preview-section-title">Professional Summary</div><p class="preview-summary">${resume.summary}</p>` : ""}
    ${resume.skills.length && resume.skills[0] !== "" ? `<div class="preview-section-title">Technical Skills</div><p class="skills-text-line"><strong>Skills:</strong> ${resume.skills.join(", ")}</p>` : ""}

    ${resume.experience.length ? `
      <div class="preview-section-title">Professional Experience</div>
      ${resume.experience.map(exp => {
        let linesHtml = "";
        if (exp.desc) {
          const lines = exp.desc.split('\n').filter(l => l.trim() !== "");
          linesHtml = `<ul class="entry-desc">${lines.map(l => `<li>${l.replace(/^[•\-\*]\s*/, '')}</li>`).join("")}</ul>`;
        }
        return `
          <div class="entry-item">
            <div class="entry-row-main">
              <span>${exp.role || "Job Title"}</span>
              <span class="entry-date">${exp.duration || "Dates"}</span>
            </div>
            <div class="entry-row-sub">
              <span>${exp.company || "Company"}</span>
              <span class="entry-location">${exp.location || "Location"}</span>
            </div>
            ${linesHtml}
          </div>
        `;
      }).join("")}
    ` : ""}

    ${resume.projects.length ? `
      <div class="preview-section-title">Key Projects</div>
      ${resume.projects.map(proj => {
        let linesHtml = "";
        if (proj.desc) {
          const lines = proj.desc.split('\n').filter(l => l.trim() !== "");
          linesHtml = `<ul class="entry-desc">${lines.map(l => `<li>${l.replace(/^[•\-\*]\s*/, '')}</li>`).join("")}</ul>`;
        }
        const absoluteUrl = proj.link ? (proj.link.startsWith('http') ? proj.link : 'https://' + proj.link) : "";
        return `
          <div class="entry-item">
            <div class="entry-row-main">
              <span>${proj.name || "Project Title"}</span>
              ${proj.tech ? `<span class="project-tech-badge">${proj.tech}</span>` : ""}
            </div>
            ${proj.link ? `<a class="entry-link-raw" href="${absoluteUrl}" target="_blank">${absoluteUrl}</a>` : ""}
            ${linesHtml}
          </div>
        `;
      }).join("")}
    ` : ""}

    ${resume.education.length ? `
      <div class="preview-section-title">Education</div>
      ${resume.education.map(edu => `
        <div class="entry-item">
          <div class="entry-row-main">
            <span>${edu.degree || "Degree Obtained"}</span>
            <span class="entry-date">${edu.duration || "Year"}</span>
          </div>
          <div class="entry-row-sub">
            <span>${edu.college || "Institution Name"}</span>
            <span class="entry-location">${edu.location || "Location"}</span>
          </div>
        </div>
      `).join("")}
    ` : ""}
    ${resume.languages.length && resume.languages[0] !== "" ? `<div class="preview-section-title">Languages</div><p class="skills-text-line"><strong>Languages:</strong> ${resume.languages.join(", ")}</p>` : ""}
  `;
}

// BIND BASE FIELD NODE ELEMENTS
["name","title","email","phone","location","portfolio","linkedin","summary","skills","languages"].forEach(id => {
  const inputEl = document.getElementById(id);
  
  // Hydrate base fields with historical values from local storage if they exist
  if (id === "skills" || id === "languages") {
    inputEl.value = resume[id].join(", ");
  } else {
    inputEl.value = resume.personal[id] || resume[id] || "";
  }

  inputEl.addEventListener("input", (e) => {
    if (id === "skills" || id === "languages") {
      resume[id] = e.target.value.split(",").map(s => s.trim());
    } else if (id === "summary") {
      resume.summary = e.target.value;
    } else {
      resume.personal[id] = e.target.value;
    }
    render();
  });
});

// CORE LIFECYCLE BLOCK AUTOMATION MANAGER
function attachBlockSync(containerId, stateArrayKey, objectFieldMappingFactory) {
  const container = document.getElementById(containerId);
  const updateState = () => {
    resume[stateArrayKey] = [...container.children].map(el => {
      const obj = {};
      Object.keys(objectFieldMappingFactory).forEach(key => {
        obj[key] = el.querySelector(objectFieldMappingFactory[key]).value;
      });
      return obj;
    });
    render();
  };

  return (htmlFields, labelName, trackingPrimarySelector, valObject = null) => {
    [...container.children].forEach(child => child.classList.remove("is-open"));

    const div = document.createElement("div");
    // If we are dynamically generating a brand new block, make it open. If it's loaded from database history, let it stay compact.
    div.className = valObject ? "dynamic-form-group" : "dynamic-form-group is-open";
    div.innerHTML = `
      <div class="group-header">
        <span class="group-title-summary">${labelName} Entry</span>
        <button class="btn-delete">✕ Remove</button>
      </div>
      <div class="group-content-wrapper">${htmlFields}</div>
    `;

    const titleSummary = div.querySelector(".group-title-summary");
    const primaryInput = div.querySelector(trackingPrimarySelector);

    // Pre-fill fields if loading historical data objects
    if (valObject) {
      Object.keys(objectFieldMappingFactory).forEach(key => {
        div.querySelector(objectFieldMappingFactory[key]).value = valObject[key] || "";
      });
      titleSummary.textContent = valObject[Object.keys(objectFieldMappingFactory)[0]] || `${labelName} Entry`;
    }

    primaryInput.addEventListener("input", () => {
      titleSummary.textContent = primaryInput.value.trim() || `${labelName} Entry`;
    });

    div.querySelector(".group-header").addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-delete")) return;
      const wasOpen = div.classList.contains("is-open");
      [...container.children].forEach(child => child.classList.remove("is-open"));
      if (!wasOpen) div.classList.add("is-open");
    });

    div.querySelector(".btn-delete").addEventListener("click", () => { div.remove(); updateState(); });
    div.addEventListener("input", updateState);
    container.appendChild(div);
    updateState();
  };
}

const addExperienceBlock = attachBlockSync("experienceContainer", "experience", {
  role: ".exp-role", company: ".exp-company", location: ".exp-loc", duration: ".exp-dur", desc: ".exp-desc"
});
const addProjectBlock = attachBlockSync("projectContainer", "projects", {
  name: ".proj-name", tech: ".proj-tech", link: ".proj-link", desc: ".proj-desc"
});
const addEducationBlock = attachBlockSync("educationContainer", "education", {
  degree: ".edu-degree", college: ".edu-college", location: ".edu-loc", duration: ".edu-dur"
});

// HTML SUB-TEMPLATE STRUCTS
const templates = {
  exp: `
    <input placeholder="Job Title / Role" class="resume__input exp-role"/>
    <input placeholder="Company / Organization" class="resume__input exp-company"/>
    <input placeholder="Location (e.g., Ahmedabad, Gujarat)" class="resume__input exp-loc"/>
    <input placeholder="Dates (e.g., Nov 2025 - Present)" class="resume__input exp-dur"/>
    <textarea placeholder="Bullet responsibilities..." class="resume__textarea exp-desc"></textarea>
  `,
  proj: `
    <input placeholder="Project Name" class="resume__input proj-name"/>
    <input placeholder="Technologies Used (e.g., Next.js, Tailwind)" class="resume__input proj-tech"/>
    <input placeholder="Full Link Address (e.g., github.com/username/project)" class="resume__input proj-link"/>
    <textarea placeholder="Key contributions..." class="resume__textarea proj-desc"></textarea>
  `,
  edu: `
    <input placeholder="Degree (e.g., BSc, XII)" class="resume__input edu-degree"/>
    <input placeholder="School / University" class="resume__input edu-college"/>
    <input placeholder="Campus Location (e.g., Varanasi, UP)" class="resume__input edu-loc"/>
    <input placeholder="Duration / Year (e.g., 2018 - 2021)" class="resume__input edu-dur"/>
  `
};

// USER TRIGGER EVENTS FOR NEW BLOCKS
document.getElementById("addExp").addEventListener("click", () => addExperienceBlock(templates.exp, "Experience", ".exp-role"));
document.getElementById("addProject").addEventListener("click", () => addProjectBlock(templates.proj, "Project", ".proj-name"));
document.getElementById("addEdu").addEventListener("click", () => addEducationBlock(templates.edu, "Education", ".edu-degree"));

// 3. RETROACTIVE HYDRATION LAYER (REBUILDS ACCORDIONS FOR RETURNING VISITORS)
if (resume.experience.length) resume.experience.forEach(item => addExperienceBlock(templates.exp, "Experience", ".exp-role", item));
if (resume.projects.length) resume.projects.forEach(item => addProjectBlock(templates.proj, "Project", ".proj-name", item));
if (resume.education.length) resume.education.forEach(item => addEducationBlock(templates.edu, "Education", ".edu-degree", item));

// EXPORT TO PDF
document.getElementById("downloadPdf").addEventListener("click", () => {
  const element = document.getElementById("preview");
  html2pdf().set({
    margin: 0,
    filename: `${resume.personal.name || 'Resume'}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    pagebreak: { mode: ['avoid-all', 'css'] }
  }).from(element).save();
});

// INITIAL HYDRATION RUN
render();


// ==========================================================================
// SECURE CREATOR ADMIN HUB INTERCEPTOR (PASSWORD GATED)
// ==========================================================================

// Simple string hash calculator to keep your plain text password hidden in source code
function calculateSimpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to a 32bit integer
  }
  return hash;
}

/* The password token hash below corresponds to the text password: "admin"
   If you want to change your password, type your new password into an online
   string hash calculator (or use console.log(calculateSimpleHash("your_password")))
   and replace the number below with your new hash integer.
*/
const SECRET_CREATOR_TOKEN_HASH = 92668751; 

// Secret Global Keyboard Trigger Shortcut: Press Ctrl + Shift + A together
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
    e.preventDefault();

    // Check if the panel already exists in the DOM window
    let existingPanel = document.getElementById("creatorAdminPanel");
    
    if (existingPanel) {
      existingPanel.classList.toggle("is-visible");
    } else {
      // Prompt for your private password token
      const userGateKey = prompt("Enter ResuBuild Creator Master Key:");
      
      if (userGateKey && calculateSimpleHash(userGateKey) === SECRET_CREATOR_TOKEN_HASH) {
        injectAndOpenCreatorPanel();
      } else if (userGateKey) {
        alert("❌ Access Denied: Invalid Creator Token.");
      }
    }
  }
});

// DYNAMICALIY GENERATE ADMIN DASHBOARD ONLY UPON VALID AUTHORIZATION
function injectAndOpenCreatorPanel() {
  const panelDiv = document.createElement("div");
  panelDiv.id = "creatorAdminPanel";
  panelDiv.className = "creator-admin-panel";
  
  panelDiv.innerHTML = `
    <div class="admin-panel-header">
      <h4>🚀 ResuBuild Creator Hub</h4>
      <button id="closeAdminPanel" class="admin-close-btn">✕</button>
    </div>
    <div class="admin-panel-content">
      <div class="admin-stat-card">
        <span class="stat-label">System Mode</span>
        <span class="stat-value text-glow-cyan">Production Active</span>
      </div>
      <div class="admin-stat-card">
        <span class="stat-label">Local Storage Key</span>
        <code class="stat-code">resubuild-user-data</code>
      </div>
      
      <div class="admin-action-section">
        <h5>Developer Utilities</h5>
        <button id="adminLoadSample" class="admin-action-btn btn-cyan">Load Demo Data</button>
        <button id="adminWipeStorage" class="admin-action-btn btn-danger">Wipe Session Storage</button>
      </div>
    </div>
  `;

  document.body.appendChild(panelDiv);

  // Smoothly slide open using your existing transitions
  setTimeout(() => {
    panelDiv.classList.add("is-visible");
  }, 10);

  // Attach button click listener interactions to the freshly generated nodes
  panelDiv.querySelector("#closeAdminPanel").addEventListener("click", () => {
    panelDiv.classList.remove("is-visible");
  });

  panelDiv.querySelector("#adminWipeStorage").addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all Local Storage data? This resets the active layout workspace.")) {
      localStorage.removeItem("resubuild-user-data");
      window.location.reload();
    }
  });

  panelDiv.querySelector("#adminLoadSample").addEventListener("click", () => {
    const sampleProfileData = {
      personal: {
        name: "Roshani Chaurasiya",
        title: "Frontend Developer",
        email: "roshni.chaurasiya2111@gmail.com",
        phone: "8881901986",
        location: "Virar, Maharashtra",
        portfolio: "roshani-portfolio.netlify.app/",
        linkedin: "linkedin.com/in/roshani-chaurasiya-4318532a4"
      },
      summary: "Frontend Developer with 2.6 years of experience specializing in React.js and Next.js, building scalable, high-performance web applications[cite: 6]. Proficient in state management, REST API integration, SSR/SSG optimization, and reusable component-based code[cite: 7].",
      skills: ["JavaScript", "TypeScript", "React", "Next.js", "Redux", "REST API", "GenAI Integration", "HTML5", "CSS3", "SCSS", "Tailwind CSS"],
      languages: ["English", "Hindi"],
      experience: [],
      education: [],
      projects: []
    };

    localStorage.setItem("resubuild-user-data", JSON.stringify(sampleProfileData));
    window.location.reload();
  });
}