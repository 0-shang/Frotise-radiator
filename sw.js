const CACHE_NAME = 'frotise-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './logo.png',
    './icon-192.png',
    './icon-512.png',
    './products.csv',
    './clients.csv',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
];

// 安装：缓存核心文件
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 激活：清理旧缓存
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
});

// 拦截请求：优先使用网络，网络失败则使用缓存 (Network First, falling back to cache)
// 这样可以保证每次打开都是最新的 CSV 数据，如果没网则显示旧数据
self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request).then((response) => {
            // 如果请求成功，更新缓存
            if (response && response.status === 200 && e.request.method === 'GET') {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(e.request, responseClone);
                });
            }
            return response;
        }).catch(() => {
            // 如果网络失败，读取缓存
            return caches.match(e.request);
        })
    );
});