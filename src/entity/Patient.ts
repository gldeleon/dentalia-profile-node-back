import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Patient{
    @PrimaryGeneratedColumn()
    pat_id: number;

    @Column()
    pat_key: string;

    @Column()
    pat_hashseed: string;

    @Column()
    pat_active: string;
    
    @Column()
    person_id: number;
}