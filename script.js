/**
 * Skoop Hello World Application
 */

async function loadAppData() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to load app data:', error);
        return null;
    }
}

async function init() {
    const data = await loadAppData();
    if (!data) return;

    // Apply data-driven styles
    const settings = data.sections.app_settings;
    const root = document.documentElement;

    // Set CSS variables - kebab-case matching field keys for live runtime compatibility
    root.style.setProperty('--primary-color', settings.primary_color.value);
    root.style.setProperty('--background-color', settings.background_color.value);
    root.style.setProperty('--text-color', settings.text_color.value);

    // Apply content
    const storefront = data.sections.storefront;
    document.querySelector('.headline').textContent = storefront.headline.value;
    document.querySelector('.message').textContent = storefront.message.value;

    // Handle time visibility
    const timeContainer = document.querySelector('.time-container');
    const showTime = settings.show_time.value !== false;
    const showTimezone = settings.show_timezone.value !== false;

    if (showTime || showTimezone) {
        timeContainer.style.display = 'flex';
        updateTime(data);
        setInterval(() => updateTime(data), 1000);
    } else {
        timeContainer.style.display = 'none';
    }

    // Reveal the app
    document.getElementById('app-container').classList.add('loaded');
}

function updateTime(data) {
    const timeEl = document.querySelector('.time');
    const timezoneEl = document.querySelector('.timezone');
    if (!timeEl || !timezoneEl) return;

    const settings = data.sections.app_settings;
    const now = new Date();

    // Time options
    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };

    const selectedTz = settings.selected_timezone?.value;
    if (selectedTz && selectedTz !== 'Local') {
        try {
            timeOptions.timeZone = selectedTz;
        } catch (e) {
            console.error('Invalid timezone:', selectedTz);
        }
    }

    // Update Time
    if (settings.show_time.value !== false) {
        timeEl.style.display = 'inline';
        timeEl.textContent = now.toLocaleTimeString([], timeOptions);
    } else {
        timeEl.style.display = 'none';
    }

    // Update Timezone
    if (settings.show_timezone.value !== false) {
        timezoneEl.style.display = 'inline';
        const format = settings.timezone_format?.value || 'short';

        let tzString = '';
        try {
            const tzOptions = {
                timeZoneName: format === 'offset' ? 'shortOffset' : format,
            };
            if (selectedTz && selectedTz !== 'Local') tzOptions.timeZone = selectedTz;

            const parts = new Intl.DateTimeFormat('en-US', tzOptions).formatToParts(now);

            const tzPart = parts.find(p => p.type === 'timeZoneName');
            tzString = tzPart ? tzPart.value : '';
        } catch (e) {
            // Fallback for timezone
            tzString = (selectedTz && selectedTz !== 'Local') ? selectedTz : Intl.DateTimeFormat().resolvedOptions().timeZone;
        }

        timezoneEl.textContent = tzString;
    } else {
        timezoneEl.style.display = 'none';
    }
}

// Start the app
init();
