
interface User {
        name: string;
        age: number;
        isActive: boolean;
      }
      
      const user1: User = {
        name: "Shahab",
        age: 25,
        isActive: true,
      };
      
     
      type Product = {
        id: number;
        title: string;
        price: number;
        tags?: string[]; 
      };
      
      const product1: Product = {
        id: 101,
        title: "Laptop",
        price: 999.99,
      };
      