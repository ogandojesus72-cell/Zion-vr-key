import axios from 'axios';
import FormData from 'form-data';

export const uploadToYotsuba = async (buffer) => {
    try {
        const form = new FormData();
        form.append('file', buffer, { filename: 'yotsuba_upload.jpg' });

        const response = await axios.post('https://upload.yotsuba.giize.com/upload', form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        return response.data.url; 
    } catch (error) {
        console.error('Error en Yotsuba Upload Service:', error);
        throw new Error('No se pudo subir el archivo a la nube.');
    }
};