#include<stdio.h>
main(){
	int arr[3][3];
	
	printf("Enter 1st number : ");
	scanf("%d",&arr[0][0]);
	
	printf("Enter 2nd number : ");
	scanf("%d",&arr[0][1]);
	
	printf("Enter 3rd number : ");
	scanf("%d",&arr[0][2]);
	
	printf("Enter 4th number : ");
	scanf("%d",&arr[1][0]);
	
	printf("Enter 5th number : ");
	scanf("%d",&arr[1][1]);
	
	printf("Enter 6th number : ");
	scanf("%d",&arr[1][2]);
	
	printf("Enter 7th number : ");
	scanf("%d",&arr[2][0]);
	
	printf("Enter 8th number : ");
	scanf("%d",&arr[2][1]);
	
	printf("Enter 9th number : ");
	scanf("%d",&arr[2][2]);
	
	int i,j;
					
		for(i=0; i<=2; i++){
			for(j=0; j<=2; j++){
					if(arr[i][j]>=0){
				
					printf("");
				}
				else{
					printf(" Ngative numbers array : %d\n",arr[i][j]);
				}
			}
			
			printf("\n");
		}
}
