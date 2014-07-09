IREvaluation
============

IR evaluation tool

Performing IR evaluation is a difficult task. When multiple systems output is to be compared, a single metric does not convey complete information about the ranked results. Different metrics for comparison makes analysis more complex. A single system performing good across all metrics makes the problem simpler but majority of the times the situation is otherwise. 

Comparing the incremental growth of an individual system is complex. Comparing against own previous results where the results varies by changing ranking, retrieval models and other query formulation techniques is quite tricky. Hard to determine the statistical significance with change in one particualr evaluation measure.

Our tool presents a visual representation of different ranked list output for an IR task.
Instead of the matrix of numbers(complex to read and interpret) we have the graphical representation of how the results varies across different runs, while changing/selecting different parameters such as evaluation  metric, averaged or query based representation.
