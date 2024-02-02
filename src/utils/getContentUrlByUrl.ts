import axios from 'axios';
import * as cheerio from 'cheerio';

export async function getContentUrlByUrl(url: string) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const contentUrl =
      $('meta[property="og:video"]').attr('content') ??
      $('meta[property="og:image"]').attr('content');

    return contentUrl;
  } catch (error) {
    console.error(error);
    return '';
  }
}
