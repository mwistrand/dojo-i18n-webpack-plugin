import i18n, { Messages, switchLocale } from 'dojo-i18n/i18n';
import bundle from './nls/main';

switchLocale('fr');
i18n(bundle).then((messages: Messages) => {
	console.log(messages['hello']);
});
