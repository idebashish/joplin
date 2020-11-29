import { ModelFeedPage } from '../../../models/utils/paginatedFeed';
import { PaginationOrderDir } from '../../../models/utils/types';
import { Request } from '../Api';
import requestPaginationOptions from '../utils/requestPaginationOptions';

// Note that this is inefficient pagination as it requires all the items to
// have been loaded first, even if not all of them are returned.
//
// It's however convenient for smaller lists as it reduces the need for
// building complex SQL queries.
export default function(items: any[], request: Request): ModelFeedPage {
	const pagination = requestPaginationOptions(request);
	console.info('requestPaginationOptions', request, pagination);
	const startIndex = (pagination.page - 1) * pagination.limit;
	const itemCount = Math.min(items.length - startIndex, pagination.limit);
	const hasMore = itemCount >= pagination.limit;

	const sortBy = pagination.order[0].by;
	const sortDir = pagination.order[0].dir;
	const caseInsensitive = pagination.order[0].caseInsensitive;
	const sortedItems = items.slice();

	sortedItems.sort((a: any, b: any) => {
		let v1 = a && (sortBy in a) ? a[sortBy] : '';
		let v2 = b && (sortBy in b) ? b[sortBy] : '';
		if (caseInsensitive && typeof v1 === 'string') v1 = v1.toLowerCase();
		if (caseInsensitive && typeof v2 === 'string') v2 = v2.toLowerCase();

		if (sortDir === PaginationOrderDir.ASC) {
			if (v1 < v2) return -1;
			if (v2 > v1) return +1;
		} else {
			if (v1 > v2) return -1;
			if (v2 < v1) return +1;
		}

		return 0;
	});

	return {
		items: sortedItems.slice(startIndex, startIndex + itemCount),
		has_more: hasMore,
	};
}
