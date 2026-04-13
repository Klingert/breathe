document.addEventListener('DOMContentLoaded', () => {
    const inputs = ['gesamtzeit', 'einatmen', 'halten1', 'ausatmen', 'halten2'];

    inputs.forEach(id => {
        const saved = localStorage.getItem(id);
        if (saved !== null) {
            document.getElementById(id).value = saved;
        } else {
            document.getElementById(id).value = config[id];
        }

        document.getElementById(id).addEventListener('input', (e) => {
            localStorage.setItem(id, e.target.value);
        });
    });
});
