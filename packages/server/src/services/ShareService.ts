// import Logger from '@joplin/lib/Logger';
// import { File, FileContentType, ShareType } from '../db';
import { Models } from '../models/factory';

// const logger = Logger.create('ShareService');

export default class ShareService {

	private models_: Models;

	public constructor(models: Models) {
		this.models_ = models;
	}

	public get models(): Models {
		return this.models_;
	}

	// public async updateSharedItems() {
	// 	while (true) {
	// 		const latestProcessedChange = await this.models.keyValue().value<string>('ShareService::latestProcessedChange');

	// 		const changes = await this.models.change().allFromId(latestProcessedChange || '');
	// 		if (!changes.length) break;

	// 		for (const change of changes) {

	// 		}
	// 	}
	// }

	// public async processUserAutoShare(userId:Uuid) {
	// 	const shares = await this.models.share().sharesByUser(userId, ShareType.JoplinApp);
	// 	console.info(shares);
	// }

	// public async processAutoShare() {
	// 	const changes = await this.models.change().allFromId('');
	// 	const fileIds = [...new Set(changes.map(c => c.item_id))];
	// 	const files = await this.models.file().loadByIds(fileIds, { skipPermissionCheck: true });
	// 	const filesById = files.reduce<Record<string, File>>((previous, current) => {
	// 		previous[current.id] = current;
	// 		return previous;
	// 	}, {});

	// 	for (const change of changes) {
	// 		const file = filesById[change.item_id];
	// 		if (!file) {
	// 			logger.warn(`Change without a file: ${change.id}`);
	// 			continue;
	// 		}

	// 		if (file.content_type !== FileContentType.JoplinItem) continue;


	// 	}
	// }

}