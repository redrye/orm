type ComparisonOperator = '=' | '!=' | '>' | '<' | '>=' | '<=';

type WhereCondition<T> = {
    field: keyof T;
    operator: ComparisonOperator;
    value: any;
};

export class QueryBuilder<T> {
    private conditions: WhereCondition<T>[] = [];
    private limitValue: number | null = null;
    private skipValue: number | null = null;
    private orderByField: keyof T | null = null;
    private orderDirection: 'asc' | 'desc' = 'asc';

    constructor(private model: any) {
        this.model = model;
    }

    where(field: keyof T, operatorOrValue: ComparisonOperator | any, value?: any): this {
        let operator: ComparisonOperator = '=';
        let actualValue = value;

        if (value === undefined) {
            actualValue = operatorOrValue;
        } else {
            operator = operatorOrValue as ComparisonOperator;
        }

        this.conditions.push({
            field,
            operator,
            value: actualValue
        });

        return this;
    }

    limit(value: number): this {
        this.limitValue = value;
        return this;
    }

    skip(value: number): this {
        this.skipValue = value;
        return this;
    }

    orderBy(field: keyof T, direction: 'asc' | 'desc' = 'asc'): this {
        this.orderByField = field;
        this.orderDirection = direction;
        return this;
    }

    async get(): Promise<T[]> {
        try {
            // @ts-ignore
            const allRecords = await this.model.all<T>();
            return this.applyFilters(allRecords);
        } finally {
            this.reset();
        }
    }

    async first(): Promise<T | null> {
        const results = await this.limit(1).get();
        return results[0] || null;
    }

    private applyFilters(records: T[]): T[] {
        let result = this.applyConditions(records);
        result = this.applyOrdering(result);
        result = this.applyPagination(result);
        return result;
    }

    private applyConditions(records: T[]): T[] {
        return records.filter(record => {
            return this.conditions.every(condition => {
                const fieldValue = record[condition.field];
                return this.evaluateCondition(fieldValue, condition.operator, condition.value);
            });
        });
    }

    private evaluateCondition(fieldValue: any, operator: ComparisonOperator, value: any): boolean {
        switch (operator) {
            case '=':
                return fieldValue === value;
            case '!=':
                return fieldValue !== value;
            case '>':
                return fieldValue > value;
            case '<':
                return fieldValue < value;
            case '>=':
                return fieldValue >= value;
            case '<=':
                return fieldValue <= value;
            default:
                return true;
        }
    }

    private applyOrdering(records: T[]): T[] {
        if (!this.orderByField) return records;

        return [...records].sort((a, b) => {
            const aValue = a[this.orderByField!];
            const bValue = b[this.orderByField!];

            if (aValue === bValue) return 0;

            const comparison = aValue < bValue ? -1 : 1;
            return this.orderDirection === 'asc' ? comparison : -comparison;
        });
    }

    private applyPagination(records: T[]): T[] {
        let result = records;

        if (this.skipValue !== null) {
            result = result.slice(this.skipValue);
        }

        if (this.limitValue !== null) {
            result = result.slice(0, this.limitValue);
        }

        return result;
    }

    private reset(): void {
        this.conditions = [];
        this.limitValue = null;
        this.skipValue = null;
        this.orderByField = null;
        this.orderDirection = 'asc';
    }
}