type X = {
	__typename: 'Person' | 'Planet';
	id: string;
} & (
		{
			__typename: 'Person';
			name: string;
			age: number;
		} |
		{
			__typename: 'Planet';
			planetName: string;
		}
	);
