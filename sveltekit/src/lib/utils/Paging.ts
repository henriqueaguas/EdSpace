const MAX_PAGING_LIMIT = 40;

export type ResultWithPaging<T> = {
  data: T[];
  count: number;
  currentPage: number;
  pagesLeft: number;
  hasMore: boolean;
};

export type UnparsedPaging = {
  skip?: number;
  take?: number;
};

type SafePaging = { skip: number; take: number };

export class Paging {
  private opts: SafePaging;

  constructor(pagingOpts?: UnparsedPaging) {
    this.opts = this.sanitize(pagingOpts || {});
  }

  get take() {
    return this.opts?.take;
  }

  get skip() {
    return this.opts?.skip;
  }

  build<T>(data: T[], totalCount: number): ResultWithPaging<T> {
    return {
      data,
      count: data.length,
      currentPage: Math.floor((this.opts.skip / this.opts.take) + 1),
      pagesLeft:
        // total nr of pages
        Math.floor(
          Math.ceil(totalCount / this.opts.take) -
            // current page nr
            ((this.opts.skip / this.opts.take) + 1),
        ),
      hasMore: (this.opts.skip + data.length) < totalCount,
    };
  }

  private sanitize(pagingOpts: UnparsedPaging): SafePaging {
    let take = MAX_PAGING_LIMIT;
    if (pagingOpts.take !== undefined) {
      if (pagingOpts.take < 1) {
        take = 0;
      }

      if (pagingOpts.take > MAX_PAGING_LIMIT) {
        take = MAX_PAGING_LIMIT;
      } else {
        take = pagingOpts.take;
      }
    }

    let skip = 0;
    if (pagingOpts.skip !== undefined) {
      if (pagingOpts.skip < 0) {
        skip = 0;
      }

      skip = pagingOpts.skip;
    }

    return {
      take,
      skip,
    };
  }
}
