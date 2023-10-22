let token = '';
let repoAsCollaborator;

// Fetch repositories
async function fetchRepoAsCollaborator(token) {
    let response = await fetch('https://api.github.com/user/repos?affiliation=collaborator', {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    
    let data = await response.json();
    if (response.status !== 200) {
        console.log('Please provide a valid token')
        return;
    } else {
        let repoArr = [];
        let repo;
        let fullname;
        let ownerUrl;
        let pictureUrl;
        let repoUrl;
        
        for (let i = 0; i < data.length; i++) {
            fullname = data[i].full_name;
            ownerUrl = data[i].owner.html_url;
            pictureUrl = data[i].owner.avatar_url;
            repoUrl = data[i].html_url;
            repo = {
                fullname: fullname,
                owner: ownerUrl,
                picture: pictureUrl,
                repoUrl: repoUrl
            }
            repoArr.push(repo)
        }
        return repoArr
    }
}

// Store token in the chrome storage
function storeToken(token) {
    chrome.storage.sync.set({ token: token}, function (){
        console.log(`Token stored successfully: ${token}`)
    })
}

// Get token from chrome storage
async function getToken() {
    let storedToken = await chrome.storage.sync.get(['token']).then((result) => {
        let savedToken = result.token;
        console.log(`Stored token found : ${savedToken}`)
        return savedToken;
    })
    return storedToken
}

// Add and store token in the chrome storage
function newToken() {
    let submitButton = document.getElementById("submit");
    submitButton.addEventListener('click', async (event) => {
        let tokenInput = document.getElementById('token');
        token = tokenInput.value
        console.log(`New token set : ${token}`)
        storeToken(token)
    })
    return token
}

// Display repo to popup.html
async function displayRepo(token) {
    let repositoryDiv = document.getElementById('repositories');
    let errorMessage = document.getElementById('error-message');
    let addTokenButton = document.getElementById("add-token");
    let manageTokenDiv = document.getElementById("manage-token");


    if (token == '') {
        console.log('No token found')
        errorMessage.classList.remove('display-none')
    } else {
        console.log(`Token found : ${token}`)
        repoAsCollaborator = await fetchRepoAsCollaborator(token);
        if (repoAsCollaborator !== undefined) {
            // Hide error message
           errorMessage.classList.add('display-none')
           addTokenButton.classList.add('display-none')
           manageTokenDiv.classList.remove('display-none')
           let divTemplateRepo; 
           repoAsCollaborator.forEach(repo => {
                divTemplateRepo = `
                    <div class='flex-row-between repo'>
                    <div class='repo-info'>
                    <div>
                    <a href='${repo.owner}' target='_blank'>
                    <img src=${repo.picture} alt='github-picture' class='owner-picture'>
                    </a>
                    </div>
                    <div class="repo-fullname">
                    <a href='${repo.repoUrl}' target='_blank'>${repo.fullname}</a>
                    </div>
                    </div>
                    <div class="">
                    <a href='${repo.repoUrl}' target='_blank'>
                    <i class="fa-solid fa-up-right-from-square"></i>
                    </a>
                    </div>
                    </div>
                `;
                repositoryDiv.insertAdjacentHTML('beforeend', divTemplateRepo)
            });  
        } else {
            // Show error errorMessage
            errorMessage.classList.remove('display-none')
        }
    }
}

newToken()
token = await getToken()
await displayRepo(token)

/*
.########...#######..##.....##
.##.....##.##.....##.###...###
.##.....##.##.....##.####.####
.##.....##.##.....##.##.###.##
.##.....##.##.....##.##.....##
.##.....##.##.....##.##.....##
.########...#######..##.....##
*/

let addTokenButton = document.getElementById("add-token");
let formDiv = document.getElementById("new-token");
let manageTokenDiv = document.getElementById("manage-token");
let form = document.getElementById("form");
let close = document.getElementById("close");
let errorMessage = document.getElementById('error-message')
let tokenInput = document.getElementById('token');

// Show form and hide add button
addTokenButton.addEventListener('click', (event) => {
    addTokenButton.classList.add('display-none')
    form.classList.remove('display-none')
    tokenInput.value = token
    form.classList.add('fade')      
    form.classList.add('flex-row-between')
    errorMessage.classList.add('display-none')      
})

// Hide form and show manage token icon
form.addEventListener('submit', (event) => {
    form.classList.add('display-none');
    form.classList.remove('fade');      
    form.classList.remove('flex-row-between');
    manageTokenDiv.classList.remove('display-none')
    // Display repositories
    displayRepo(token)

})

// Hide manage token icon and show form
manageTokenDiv.addEventListener('click', (event) => {
    form.classList.remove('display-none');
    tokenInput.value = token
    form.classList.add('fade');      
    form.classList.add('flex-row-between');
    manageTokenDiv.classList.add('display-none')
    errorMessage.classList.add('display-none')
})

// Hide form
close.addEventListener('click', (event) => {
    manageTokenDiv.classList.remove('display-none');
    form.classList.add('display-none');
    form.classList.remove('fade');      
    form.classList.remove('flex-row-between');
})





