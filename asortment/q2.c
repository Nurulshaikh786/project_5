#include<stdio.h>
main(){
	int  i,j,rows,max,column;
	
	printf("Enter Array's Row Size : ");
	scanf("%d",&rows);
	
	printf("Enter Array's Column Size : ");
	scanf("%d", &column);
    
	int array[rows][column];  
    printf("array's elements:\n");
    for (i=0; i<rows; i++) {
        for (j=0; j<column; j++){
        	
            printf("a[%d][%d] = ", i, j);
            scanf("%d",&array[i][j]);
            
        }
    }
    max=array[0][0];
    for (i=0; i<rows; i++){
    	
        for (j=0; j<column; j++){
        	
            if (array[i][j]>max){
            	
                max=array[i][j];
                
            }
        }
    }
    printf("largest Number in Array is: %d\n", max);
   
}
