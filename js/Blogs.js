document.addEventListener('DOMContentLoaded', function () {
    const projectsContainer = document.getElementById('projects-container');
    const blogsContainer = document.getElementById('blogs-container');

// Parses the markdown and file info to return an object with blog info
    const getFileInfo = (markdown, file) => {
        let separator = '---';
        if (markdown.includes('\r\n')) {
            separator += '\r\n';
        } else if (markdown.includes('\n')) {
            separator += '\n';
        }
        let firstSeparatorIndex = markdown.indexOf(separator);
        let header = '';
        if (firstSeparatorIndex !== -1) {
            markdown = markdown.slice(firstSeparatorIndex + separator.length, markdown.length).trim();
            let secondSeparatorIndex = markdown.indexOf(separator);
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
                // Return a default object if the header can't be parsed
                return {
                    title: '',
                    subTitle: '',
                    description: '',
                    image: {url: '', alt: ''},
                    author: '',
                    authorPP: '',
                    pubdate: '',
                    tags: [],
                    readTime: 0,
                    fileName: ''
                };
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
    };

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

    function iterateBlogFiles() {
        const blogFiles = [
            "projects/Balbino/Balbino.md",
            "projects/CoL/CoL.md",
            "projects/NOX/NOX.md",
            "projects/SoftwareRayTracer/SoftwareRayTracer.md",
            "projects/SoftwareRasterizer/SoftwareRasterizer.md",
            "projects/AIProgramming/AIProgramming.md",
            "blogs/GART/gart1.md",
            "blogs/GANM/ganm1.md",
            "blogs/LCM/LCM.md"
        ];
        const promises = blogFiles.map(file => new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const direction = `https://raw.githubusercontent.com/JoranVandenbroucke/joranvandenbroucke.github.io/main/assets/markdown/${file}`;
            xhr.open('GET', direction, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    const markdown = xhr.responseText;
                    const blogInfo = getFileInfo(markdown, file);
                    resolve(blogInfo);
                } else if (xhr.readyState === 4) {
                    reject(xhr.status);
                }
            };
            xhr.send();
        }));
        Promise.all(promises)
            .then(blogInfos => {
                blogInfos.forEach(appendItem);
            })
            .catch(error => {
                console.error(`Failed to fetch file: ${error}`);
            });
    }

    iterateBlogFiles();
});
