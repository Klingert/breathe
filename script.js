document.addEventListener('DOMContentLoaded', () => {
    const inputs = ['gesamtzeit', 'einatmen', 'halten1', 'ausatmen', 'halten2'];
    const playButton = document.getElementById('play-button');
    const timerDisplay = document.getElementById('timer-display');
    const elapsedTimeEl = document.getElementById('elapsed-time');
    const totalTimeEl = document.getElementById('total-time');
    const inputSection = document.getElementById('input-section');
    const circleIndicator = document.getElementById('circle-indicator');
    const progressBar = document.getElementById('progress-bar');

    const phases = ['einatmen', 'halten1', 'ausatmen', 'halten2'];
    const circumference = 2 * Math.PI * 35;

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

    function formatTime(totalSeconds) {
        const mins = Math.floor(totalSeconds / 60);
        const secs = Math.floor(totalSeconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function getPhaseDurations() {
        return {
            einatmen: parseInt(document.getElementById('einatmen').value) || config.einatmen,
            halten1: parseInt(document.getElementById('halten1').value) || config.halten1,
            ausatmen: parseInt(document.getElementById('ausatmen').value) || config.ausatmen,
            halten2: parseInt(document.getElementById('halten2').value) || config.halten2
        };
    }

    function initCircleProgress(durations) {
        const total = durations.einatmen + durations.halten1 + durations.ausatmen + durations.halten2;
        let cumulativeOffset = 0;
        const phaseAngles = [];

        phases.forEach(phase => {
            const segment = document.getElementById(`circle-${phase}`);
            const phaseLength = (durations[phase] / total) * circumference;
            segment.style.strokeDasharray = `${phaseLength} ${circumference}`;
            segment.style.strokeDashoffset = -cumulativeOffset;
            phaseAngles.push((durations[phase] / total) * 360);
            cumulativeOffset += phaseLength;
        });

        document.getElementById('label-einatmen').setAttribute('x', 100);
        document.getElementById('label-einatmen').setAttribute('y', 20);
        document.getElementById('label-halten1').setAttribute('x', 100);
        document.getElementById('label-halten1').setAttribute('y', 90);
        document.getElementById('label-ausatmen').setAttribute('x', 15);
        document.getElementById('label-ausatmen').setAttribute('y', 90);
        document.getElementById('label-halten2').setAttribute('x', 15);
        document.getElementById('label-halten2').setAttribute('y', 20);

        circleIndicator.style.transform = 'rotate(-90deg)';
        circleIndicator.style.transformOrigin = '50px 50px';
    }

    playButton.addEventListener('click', () => {
        const gesamtzeitMin = parseFloat(document.getElementById('gesamtzeit').value) || config.gesamtzeit;
        const gesamtzeitSec = gesamtzeitMin * 60;
        const durations = getPhaseDurations();
        const cycleDuration = durations.einatmen + durations.halten1 + durations.ausatmen + durations.halten2;

        initCircleProgress(durations);
        progressBar.style.width = '0%';
        totalTimeEl.textContent = formatTime(gesamtzeitSec);
        elapsedTimeEl.textContent = '00:00';

        inputSection.classList.add('hidden');
        document.getElementById('gesamtzeit-group').classList.add('hidden');
        document.getElementById('play-button').classList.add('hidden');
        timerDisplay.classList.add('active');

        let elapsed = 0;
        let cycleElapsed = 0;
        let currentPhaseIndex = 0;

        const updatePhase = () => {
            phases.forEach(p => document.getElementById(`circle-${p}`).style.opacity = '0.3');
            document.getElementById(`circle-${phases[currentPhaseIndex]}`).style.opacity = '1';
        };

        const interval = setInterval(() => {
            elapsed++;
            cycleElapsed++;

            elapsedTimeEl.textContent = formatTime(elapsed);

            const progress = (elapsed / gesamtzeitSec) * 100;
            progressBar.style.width = Math.min(progress, 100) + '%';

            const angle = -90 + (cycleElapsed / cycleDuration) * 360;
            circleIndicator.style.transform = `rotate(${angle}deg)`;

            if (cycleElapsed > cycleDuration) {
                cycleElapsed = 1;
            }

            const phaseDurations = [durations.einatmen, durations.halten1, durations.ausatmen, durations.halten2];
            let accumulated = 0;
            for (let i = 0; i < phaseDurations.length; i++) {
                accumulated += phaseDurations[i];
                if (cycleElapsed <= accumulated) {
                    if (currentPhaseIndex !== i) {
                        currentPhaseIndex = i;
                        updatePhase();
                    }
                    break;
                }
            }

            if (elapsed >= gesamtzeitSec) {
                clearInterval(interval);
                setTimeout(() => {
                    timerDisplay.classList.remove('active');
                    inputSection.classList.remove('hidden');
                    document.getElementById('gesamtzeit-group').classList.remove('hidden');
                    document.getElementById('play-button').classList.remove('hidden');
                }, 500);
            }
        }, 1000);
    });
});
