import axios from 'axios';
import { load } from 'cheerio';

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function checkForHousingList() {
  const url = 'https://trouverunlogement.lescrous.fr/tools/39/accommodations';

  try {
    const { data } = await axios.get(url);
    const $ = load(data);
    
    // Vérifier si la liste des logements est présente
    const housingList = $('ul.fr-grid-row.fr-grid-row--gutters.svelte-11sc5my');
    
    if (housingList.length > 0) {
      const items = housingList.find('li.fr-col-12');
      
      if (items.length > 0) {
        let message = '🏠 *Des logements CROUS sont disponibles !*\n\n';
        message += `🔍 ${items.length} logement(s) trouvé(s)\n`;
        message += `🌍 ${url}\n\n`;
        message += 'Allez vite vérifier sur le site !';
        
        return message;
      }
    }
    
    return null;
  } catch (e) {
    console.error('Erreur de récupération :', e.message);
    return null;
  }
}

async function sendTelegramMessage(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  return axios.post(url, {
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: 'Markdown',
    disable_web_page_preview: false, // Permettre l'aperçu pour le lien
  });
}

async function main() {
  const message = await checkForHousingList();
  
  if (message) {
    console.log('Logements trouvés, envoi du message...');
    await sendTelegramMessage(message);
  } else {
    console.log('Aucun logement disponible trouvé.');
  }
}

main();
