#include<stdio.h>
int main() {
	
    int  i, j,rows, columns;
    
    printf("Enter Array's Row Size : ");
	scanf("%d",&rows);
	
	printf("Enter Array's Column Size : ");
	scanf("%d", &columns);
	
    columns = rows; 
    
    int arr[rows][columns], transpose[rows][columns];
    
    printf("Enter array's elements:\n");
    
    for (i=0; i<rows; i++) {
    	
        for (j=0; j<columns; j++) {
        	
        printf("a[%d][%d] = ",i,j);
        scanf("%d", &arr[i][j]);
        
        }
    }
    for (i=0; i<rows; i++) {
    	
        for (j=0; j<columns; j++) {
        	
        transpose[j][i] = arr[i][j];
        
        }
    }
    printf("The transpose matrix of an array:\n");
    
    for (i=0; i<rows; i++) {
    	
        for (j=0; j<columns; j++) {
        	
        printf("%d ", transpose[i][j]);
        
        }
        printf("\n");
    }
}
