# cte_example_app
An example app to test the features of the CTE addition to Sequelize


# Linked List Examples 

Project to use sequelize to impliment the following examples.

## Linked List

This example tracks the course of a book as it is borrowed by a series of friends.

```sql
CREATE TABLE borrower(
	id INTEGER,
	name TEXT,
	daysKept INTEGER,
	nextId INTEGER,
	PRIMARY KEY(id),
	FOREIGN KEY(nextId) REFERENCES x(id)
);

INSERT INTO borrower(id, name, daysKept, nextId) VALUES
(1, 'George', 5, 2),
(2, 'Lindsey', 7, 3),
(3, 'Henry', 3, 4),
(4, 'Sam', 22, 5),
(5, 'Leo', 9, 6),
(6, 'Lorelei', 14, NULL);
```
### Find how many people borrowed the book in the first 20 days

**SQL**
```sql
WITH RECURSIVE
	cte(id, nextId, totalDays) AS (
		SELECT borrower.id, borrower.nextId, borrower.daysKept FROM borrower
		WHERE 1 = id
		UNION
		SELECT borrower.id, borrower.nextId, borrower.daysKept+cte.totalDays FROM borrower, cte
		WHERE borrower.id = cte.nextId AND borrower.daysKept+cte.totalDays < 20
	)
	SELECT borrower.name FROM borrower, cte
	WHERE borrower.id = cte.id;
```
**With Sequelize API Proposal**
```js
borrower.findAll(
	{
		cte: [{
			name: 'a',
			model: borrower,
			cteAttributes: ['totalDays'],
			initial: {
				totalDays: { $col: 'borrower.daysKept' },
				where: { id: 1 }
			},
			recursive: {
				totalDays: {
					$add: [
						{ $col: 'borrower.daysKept' },
						{ $col: 'a.totalDays' }
					]	
				}
				find: 'next',
				where: {
					totalDays: {
						$lt: 20
					}		
				}
			}
		}],
		cteSelect: 'a'
	}
);
```

### Find the last 3 borrowers
**SQL**
```sql
WITH RECURSIVE
	cte(id, numberCounted) AS (
		SELECT borrower.id, 1 FROM borrower
		WHERE borrower.nextId IS NULL
		UNION
		SELECT borrower.id, cte.numberCounted+1 FROM borrower, cte
		WHERE borrower.nextId = cte.id AND cte.numberCounted+1 <= 3
	)
	SELECT borrower.name FROM borrower, cte
	WHERE borrower.id = cte.id;
```
**With Sequelize API Proposal**
```js
borrower.findAll({
	cte: [
		{
			name: 'a',
			model: borrower,
			cteAttributes: ['numberCounted'],
			initial: {
				numberCounted: 1,
				where: { id: { $eq: null } }
			},
			recursive: {
				numberCounted: {
					$add: [
						{ $col: 'a.numberCounted' },
						1	
					]
				},				
				find: 'previous',
				where: {
					numberCounted: {
						$lte: 3
					}		
				}
			}
		}
	],
	cteSelect: 'a'
});
```
