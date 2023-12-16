let projects = [];
let blogs = [];
document.addEventListener('DOMContentLoaded', function () {
    const projectsContainer = document.getElementById('projects-container');
    const blogsContainer = document.getElementById('blogs-container');

    // Function to get blog information from a markdown file
    function GetFileInfo(markdown, file) {
        let sepperator = '---';
        if (fileContent.includes('\r\n')) {
            sepperator += '\r\n';
        } else if (fileContent.includes('\n'))
        {
            sepperator += '\n';
        }
        let firstSeparatorIndex = markdown.indexOf(sepperator);
        let header = '';
        if (firstSeparatorIndex !== -1) {
            markdown = markdown.slice(firstSeparatorIndex + 4, markdown.length).trim();
            let secondSeparatorIndex = markdown.indexOf(sepperator);
            if (secondSeparatorIndex !== -1) {
                header = markdown.slice(0, secondSeparatorIndex).trim();
            }
        }

        let headerData = {};
        let readTimeMinutes;
        if (header !== null && header !== "") {
            try {
                headerData = jsyaml.load(header);
                const wordsPerMinute = 200; // Adjust this value based on your reading speed estimation
                const wordCount = markdown.trim().split(/\s+/).length;
                readTimeMinutes = Math.ceil(wordCount / wordsPerMinute);
            } catch (error) {
                console.error('Error parsing YAML:', error);
            }
        }
        return {
            title: headerData.title || '',
            subTitle: headerData.subTitle || '',
            description: headerData.description, // Assuming the entire content is the description for simplicity
            image: {url: headerData.image.url || '', alt: headerData.image.alt || ''},
            author: headerData.author || '',
            authorPP: headerData.authorPP || '',
            pubdate: headerData.pubdate || '',
            tags: headerData.tags || [],
            readTime: readTimeMinutes || 0,
            fileName: file.replace(/\s/g, '').replace(/^(\w+)\/.+\/(\w+)\.md$/g, '$1/$2') || ''
        };
    }

    // Function to create and append a blog item
    function appendItem(fileData, index) {
        let item;
        if (index === 0) {
            item = document.createElement('featured-item');
        } else if (index % 2 === 0) {
            item = document.createElement('right-item');
        } else {
            item = document.createElement('left-item');
        }

        item.setAttribute('link', fileData.fileName);
        item.setAttribute('image', fileData.image.url);
        item.setAttribute('title', fileData.title);
        item.innerHTML = fileData.description;

        if (fileData.fileName.includes('blogs'))
            blogsContainer.appendChild(item);
        else
            projectsContainer.appendChild(item)
    }


    // Function to iterate over blog files and append them
    function iterateBlogFiles() {
        const blogFiles = [
            "projects/Balbino/Balbino.md",
            "projects/CoL/CoL.md",
            "projects/NOX/NOX.md",
            "projects/SoftwareRayTracer/SoftwareRayTracer.md",
            "projects/SoftwareRasterizer/SoftwareRasterizer.md",
            "projects/AIProgramming/AIProgramming.md",
            "blogs/GART/gart1.md",
            "blogs/GANM/ganm1.md"
        ];
        projects = [];
        blogs = [];
        blogFiles.forEach(file => {
            const xhr = new XMLHttpRequest();
            const direction = `https://raw.githubusercontent.com/JoranVandenbroucke/joranvandenbroucke.github.io/main/assets/markdown/${file}`;

            xhr.open('GET', direction, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    const markdown = xhr.responseText;
                    const blogInfo = GetFileInfo(markdown, file);
                    if (file.includes('blogs'))
                        blogs.push(blogInfo);
                    else
                        projects.push(blogInfo);

                    if ((projects.length + blogs.length) === blogFiles.length) {
                        projects.forEach(appendItem);
                        blogs.forEach(appendItem);
                    }
                }
            };

            xhr.send();
        });
    }

    // Get the blog information and append blogs
    iterateBlogFiles();
});
