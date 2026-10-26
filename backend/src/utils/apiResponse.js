class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    // 1️⃣ FILTERING
    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'keyword'];
        excludedFields.forEach(el => delete queryObj[el]);

        // Advanced filtering (gt, gte, lt, lte)
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    // 2️⃣ SEARCH
    search() {
        if (this.queryString.keyword) {
            const keyword = this.queryString.keyword;
            this.query = this.query.find({
                $or: [
                    { name: { $regex: keyword, $options: 'i' } },
                    { description: { $regex: keyword, $options: 'i' } },
                    { category: { $regex: keyword, $options: 'i' } }
                ]
            });
        }
        return this;
    }

    // 3️⃣ SORTING
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt'); // Default: newest first
        }
        return this;
    }

    // 4️⃣ FIELD LIMITING
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    // 5️⃣ PAGINATION
    paginate() {
        const page = parseInt(this.queryString.page, 10) || 1;
        const limit = parseInt(this.queryString.limit, 10) || 10;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        
        // Store pagination info for response
        this.pagination = {
            page,
            limit,
            skip
        };
        
        return this;
    }

    // Get pagination metadata
    getPaginationInfo(totalDocs) {
        const { page, limit } = this.pagination || { page: 1, limit: 10 };
        const totalPages = Math.ceil(totalDocs / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        return {
            page,
            limit,
            totalDocs,
            totalPages,
            hasNext,
            hasPrev,
            nextPage: hasNext ? page + 1 : null,
            prevPage: hasPrev ? page - 1 : null
        };
    }
}

module.exports = APIFeatures;