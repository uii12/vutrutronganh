import * as THREE from 'three';

export class AudioManager {
    constructor() {
        this.audio = document.getElementById('bg-audio');
        this.defaultAudioUrl = 'assets/Nếu Như Ngày Ấy.mp3';
        this.currentAudioUrl = null;
        this.isPlaying = false;
        this.isAudioLoaded = false;
        this.setAudioUrl(this.defaultAudioUrl);
        this.setupAudioEvents();
    }

    setAudioUrl(url) {
        if (url && url !== this.currentAudioUrl) {
            this.audio.src = url;
            this.currentAudioUrl = url;
            this.audio.load();
            this.isPlaying = false;
            this.isAudioLoaded = false;
        }
    }

    setupAudioEvents() {
        // Xử lý sự kiện khi audio được load
        this.audio.addEventListener('canplaythrough', () => {
            this.isAudioLoaded = true;
            // Phát event để thông báo audio đã sẵn sàng
            document.dispatchEvent(new CustomEvent('audioLoaded'));
        });

        // Xử lý sự kiện khi audio bắt đầu phát
        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
        });

        // Xử lý sự kiện khi audio tạm dừng
        this.audio.addEventListener('pause', () => {
            console.log('Audio paused');
            this.isPlaying = false;
        });

        // Xử lý lỗi
        this.audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            this.isAudioLoaded = false;
        });

        // Xử lý sự kiện khi audio có thể phát
        this.audio.addEventListener('canplay', () => {
            console.log('Audio can play');
            this.isAudioLoaded = true;
        });
    }

    async playOnly() {
        try {

            // Chỉ phát nhạc nếu đang tạm dừng
            if (this.audio.paused) {
                // Đảm bảo audio context được resume (cần thiết cho mobile)
                if (this.audio.readyState >= 2) { // HAVE_CURRENT_DATA
                    await this.audio.play();
                    this.isPlaying = true;
                } else {
                    // Đợi audio load xong
                    this.audio.addEventListener('canplay', async () => {
                        await this.audio.play();
                        this.isPlaying = true;
                    }, { once: true });
                }
            } else {
                console.log('Audio is already playing, no action needed');
            }
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    }
} 