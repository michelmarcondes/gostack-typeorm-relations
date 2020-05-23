import {
  MigrationInterface,
  QueryRunner,
  Table,
  // TableForeignKey,
} from 'typeorm';

export default class CreateOrders1590175544216 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'customer_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    // await queryRunner.createForeignKey(
    //   'orders',
    //   new TableForeignKey({
    //     name: 'FK_OrdersCustomerIdToCustomer',
    //     columnNames: ['customer_id'],
    //     referencedTableName: 'customer',
    //     referencedColumnNames: ['id'],
    //     onDelete: 'RESTRICT',
    //     onUpdate: 'CASCADE',
    //   }),
    // );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // await queryRunner.dropForeignKey('orders', 'FK_OrdersCustomerIdToCustomer');

    await queryRunner.dropTable('orders');
  }
}
