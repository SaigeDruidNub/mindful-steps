// Camera utility functions for PWA
export class CameraManager {
  private stream: MediaStream | null = null;

  public async requestPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Camera permission denied:', error);
      return false;
    }
  }

  public async capturePhoto(): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      
      navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      .then(stream => {
        this.stream = stream;
        video.srcObject = stream;
        video.play();
        
        video.onloadedmetadata = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const context = canvas.getContext('2d');
          if (context) {
            context.drawImage(video, 0, 0);
            const imageData = canvas.toDataURL('image/jpeg', 0.8);
            
            // Stop the stream
            stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            
            resolve(imageData);
          } else {
            reject(new Error('Failed to get canvas context'));
          }
        };
      })
      .catch(reject);
    });
  }

  public stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
}