let allLogs = [];
        let currentFilter = 'all';

        const methodColors = {
            'GET': 'text-green-400',
            'POST': 'text-blue-400',
            'PUT': 'text-yellow-400',
            'DELETE': 'text-red-400',
            'PATCH': 'text-purple-400'
        };

        async function loadLogs() {
            try {
                const res = await fetch("/api/logs");
                allLogs = await res.json();
                updateStats();
                applyFilters();
            } catch (error) {
                document.getElementById("logsList").innerHTML = 
                    '<div class="text-red-400 text-center py-8">Error loading logs: ' + error.message + '</div>';
            }
        }

        function updateStats() {
            const stats = allLogs.reduce((acc, log) => {
                acc.total++;
                if (log.method === 'GET') acc.get++;
                else if (log.method === 'POST') acc.post++;
                else acc.other++;
                return acc;
            }, { total: 0, get: 0, post: 0, other: 0 });

            document.getElementById('totalCount').textContent = stats.total;
            document.getElementById('getCount').textContent = stats.get;
            document.getElementById('postCount').textContent = stats.post;
            document.getElementById('otherCount').textContent = stats.other;
        }

        function filterByMethod(method) {
            currentFilter = method;
            
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            applyFilters();
        }

        function clearFilter() {
            currentFilter = 'all';
            document.getElementById('searchInput').value = '';
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelectorAll('.filter-btn')[0].classList.add('active');
            applyFilters();
        }

        function applyFilters() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            
            let filtered = allLogs.filter(log => {
                const matchesMethod = currentFilter === 'all' || log.method === currentFilter;
                const matchesSearch = !searchTerm || log.url.toLowerCase().includes(searchTerm);
                return matchesMethod && matchesSearch;
            });

            if (filtered.length === 0) {
                document.getElementById("logsList").innerHTML = 
                    '<div class="text-slate-400 text-center py-8">No logs found matching your filters</div>';
                return;
            }

            document.getElementById("logsList").innerHTML = filtered
                .map(l => {
                    const methodColor = methodColors[l.method] || 'text-slate-400';
                    return `
                        <div class="log-entry border-b border-slate-700 py-3 px-2 rounded hover:bg-slate-700/50">
                            <div class="flex items-start gap-4">
                                <span class="text-slate-500 text-xs font-mono whitespace-nowrap">${l.time}</span>
                                <span class="${methodColor} font-bold text-sm w-16">${l.method}</span>
                                <span class="text-slate-300 text-sm font-mono flex-1 break-all">${l.url}</span>
                            </div>
                        </div>
                    `;
                })
                .join("");
        }

        loadLogs();
        setInterval(loadLogs, 300);

        const shop = JSON.parse(localStorage.getItem('shop'));
        document.getElementById('shop_name').innerText = shop.shop_name;