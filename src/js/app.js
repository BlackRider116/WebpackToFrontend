const baseUrl = 'https://backend-09-server.herokuapp.com';
// const baseUrl = 'http://localhost:9999';

let firstSeenId = 0;
let lastSeenId = 0;

let lastPosts = [];

const rootEl = document.getElementById('root');

const addFormEl = document.createElement('form');
addFormEl.innerHTML = `
<form>
  <div class="form-row">
    <div class="col-7">
    <input class="form-control" placeholder="Введите текст или url" data-id="link">
    </div>
    <select class="col" data-id="type">
            <option value="regular">Обычный</option>
             <option value="image">Изображение</option>
             <option value="audio">Аудио</option>
            <option value="video">Видео</option>
    </select>
    <button class="btn btn-primary">Добавить</button>
  </div>
</form>
`;
rootEl.appendChild(addFormEl);

const newPostsBtn = document.createElement('button');
newPostsBtn.className = 'btn btn-primary btn-block mt-1';
newPostsBtn.textContent = 'Показать новые записи';
newPostsBtn.style.display = "none";
newPostsBtn.addEventListener('click', (ev) => {
    fetch(`${baseUrl}/posts/${firstSeenId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        }).then(function (data) {
            firstSeenId = 0;
            lastPosts.unshift(...data.reverse());
            rebuildList(postsEl, lastPosts);
            newPostsBtn.style.display = "none";
        }).catch(error => {
            console.log(error);
        });

});
rootEl.appendChild(newPostsBtn);


const linkEl = addFormEl.querySelector('[data-id=link]');
const typeEl = addFormEl.querySelector('[data-id=type]');
linkEl.value = localStorage.getItem('content');
linkEl.addEventListener('input', (evt) => {
    localStorage.setItem('content', evt.currentTarget.value);
});
if (localStorage.getItem('type') !== null) {
    typeEl.value = localStorage.getItem('type');
}
typeEl.addEventListener('input', (evt) => {
    localStorage.setItem('type', evt.currentTarget.value);
});


addFormEl.addEventListener('submit', function (ev) {
    ev.preventDefault();
    const post = {
        id: 0,
        content: linkEl.value,
        type: typeEl.value,
    };
    fetch(`${baseUrl}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
    }).then(response => {
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return response.json();
    }).then(data => {
        linkEl.value = '';
        typeEl.value = 'regular';
        localStorage.clear();
        lastPosts.unshift(data);
        firstSeenId = data.id;
        rebuildList(postsEl, lastPosts);
    }).catch(error => {
        console.log(error)
    });
});


const postsEl = document.createElement('div');
rootEl.appendChild(postsEl);

const startGet = fetch(`${baseUrl}/posts/seenPosts/${lastSeenId}`)
startGet.then(response => {
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return response.json();
}).then(function (data) {
    if (data.length !== 0) {
        if (data.length < 5) {
            lastPosts.push(...data.reverse());
        } else {
            lastSeenId = data[data.length - 5].id;
            lastPosts.push(...data.reverse());
            lastPostsBtn.style.display = "block";
        }
        rebuildList(postsEl, lastPosts)
    }
}).catch(error => {
    console.log(error);
});



function rebuildList(containerEl, items) {
    containerEl.innerHTML = '';
    for (const item of items) {
        const postEl = document.createElement('div');
        postEl.className = 'card mb-2';
        if (item.type === 'regular') {
            postEl.innerHTML = `
                <div class="card-body">
                    <div class="card-text">${item.content}</div>
                    <button class="btn">♡ ${item.likes}</button>
                    <button class="btn btn-primary" data-action="like">👍</button>
                    <button class="btn btn-danger" data-action="dislike">👎</button>
                    <button class="btn btn-light" data-action="delete">Удалить пост</button>
                </div>
            `;
        } else if (item.type === 'image') {
            postEl.innerHTML = `
                <img src="${item.content}" class="card-img-top"></img>
                <div class="card-body">
                    <button class="btn">♡ ${item.likes}</button>
                    <button class="btn btn-primary" data-action="like">👍</button>
                    <button class="btn btn-danger" data-action="dislike">👎</button>
                    <button class="btn btn-light" data-action="delete">Удалить пост</button>
                </div>
            `;
        } else if (item.type === 'audio') {
            postEl.innerHTML = `
                <audio src="${item.content}" class="embed-responsive embed-responsive-21by9 card-img-top" controls></audio>
                <div class="card-body">
                    <button class="btn">♡ ${item.likes}</button>
                    <button class="btn btn-primary" data-action="like">👍</button>
                    <button class="btn btn-danger" data-action="dislike">👎</button>
                    <button class="btn btn-light" data-action="delete">Удалить пост</button>
                </div>
            `;
        } else if (item.type === 'video') {
            postEl.innerHTML = `
                <video src="${item.content}" class="embed-responsive embed-responsive-16by9 card-img-top" controls></video>
                <div class="card-body">
                    <button class="btn">♡ ${item.likes}</button>
                    <button class="btn btn-primary" data-action="like">👍</button>
                    <button class="btn btn-danger" data-action="dislike">👎</button>
                    <button class="btn btn-light" data-action="delete">Удалить пост</button>
                </div>
            `;
        };

        postEl.querySelector('[data-action=delete]').addEventListener('click', function () {
            fetch(`${baseUrl}/posts/${item.id}`, {
                method: 'DELETE',
            }).then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json();
            }).then(data => {
                const index = lastPosts.findIndex((post) => {
                    return post.id === item.id
                })
                lastPosts.splice(index, 1)
                rebuildList(postsEl, lastPosts);
            }).catch(error => {
                console.log(error)
            });
        });

        postEl.querySelector('[data-action=like]').addEventListener('click', function () {
            fetch(`${baseUrl}/posts/${item.id}/likes`, {
                method: 'POST',
            }).then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json();
            }).then(data => {
                const index = lastPosts.findIndex((post) => {
                    return post.id === item.id
                })
                lastPosts[index].likes++;
                rebuildList(postsEl, lastPosts);
            }).catch(error => {
                console.log(error)
            });
        });

        postEl.querySelector('[data-action=dislike]').addEventListener('click', function () {
            fetch(`${baseUrl}/posts/${item.id}/likes`, {
                method: 'DELETE',
            }).then(response => {
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.json();
            }).then(data => {
                const index = lastPosts.findIndex((post) => {
                    return post.id === item.id
                })
                lastPosts[index].likes--;
                rebuildList(postsEl, lastPosts);
            }).catch(error => {
                console.log(error)
            });
        });
        containerEl.appendChild(postEl);
    }
};


const lastPostsBtn = document.createElement('button');
lastPostsBtn.className = 'btn btn-primary btn-block mt-1';
lastPostsBtn.textContent = 'Показать еще посты';
lastPostsBtn.style.display = "none";
lastPostsBtn.addEventListener('click', function () {
    fetch(`${baseUrl}/posts/seenPosts/${lastSeenId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        }).then(function (data) {
            if (data.length === 0) {
                lastPostsBtn.style.display = "none";
            }
            else {
                if (data.length < 5) {
                    lastSeenId = data[data.length - 1].id;
                    lastPosts.push(...data.reverse());
                    lastPostsBtn.style.display = "none";
                } else {
                    lastSeenId = data[data.length - 5].id;
                    lastPosts.push(...data.reverse());
                    lastPostsBtn.style.display = "block";

                }
                rebuildList(postsEl, lastPosts);
            }
        }).catch(error => {
            console.log(error);
        });
})
rootEl.appendChild(lastPostsBtn);


setInterval(() => {
    const promise = fetch(`${baseUrl}/posts/${firstSeenId}`)
    promise.then(response => {
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return response.json();
    }).then(function (data) {
        if (data.length === 0) {
            console.log('Новых постов нет');
            newPostsBtn.style.display = "none";
        }
        else {
            if (firstSeenId === 0) {
                firstSeenId = data[data.length - 1].id;
                newPostsBtn.style.display = "none";
            } else {
                newPostsBtn.style.display = "block";
            }
        }
        // console.log(data)
        // console.log('firstSeenId = ' + firstSeenId)
    }).catch(error => {
        console.log(error);
    });
}, 3000);