document.addEventListener('DOMContentLoaded', () => {
    function $(e) { return document.querySelector(e) };


    const EDIT = $('#edit-post');
    const body = $('.description');
    let bodyHEADER = $('#body-header'); 
    let saveBTN = document.createElement('button');

    function save(e){
        EDIT.style.display = 'block';
        e.setAttribute('contenteditable', false);
        body.style.border = 'none';
        bodyHEADER.removeChild(saveBTN); 
    }
    function edit(e){
        EDIT.style.display = 'none';
        e.setAttribute('contenteditable', true);
        e.style.padding = '10px';
        saveBTN.textContent = 'SAVE';
        saveBTN.style.width = '100px';
        saveBTN.style.border = 'none';
        saveBTN.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
        saveBTN.style.borderRadius = '5px';
        saveBTN.style.backgroundColor = 'rgb(22, 255, 134)'; 
        saveBTN.style.color = 'white';
        saveBTN.style.fontWeight = 'bold'  
        saveBTN.focus = true; 
        bodyHEADER.append(saveBTN); 
        body.style.border = '3px solid gray';
        body.style.borderRadius = '5px';
}

        const blogID = getBlogIdFromUrl();
        saveBTN.addEventListener('click', () => {
            const newContent = body.textContent;
            updateBlog(blogID, newContent);
            save(body);
        });
        
        function updateBlog(blogId, newContent) {
        fetch(`/blogs/view/edit/${blogId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ body: newContent }) 
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update blog');
            }
            console.log('Blog updated successfully');
        })
        .catch(error => {
            console.error('Error updating blog:', error);
        });
    }

    function getBlogIdFromUrl() {
    const url = window.location.href;
    const parts = url.split('/');
    return parts[parts.length - 1];
    }

    EDIT.addEventListener('click', ()=>{
        edit(body)
    })
    const pass = $('.pass');
    pass.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const formData = new FormData(pass);

            const formDataJSON = {};
            formData.forEach((value, key) => {
                formDataJSON[key] = value;
            });

            const response = await fetch('/add-blog', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formDataJSON)
            });

            if (!response.ok) {
                throw new Error('Failed to add blog');
            }
            window.location.href = '/'
        } catch (err) {
            console.error(err);
        }
    });
    
});