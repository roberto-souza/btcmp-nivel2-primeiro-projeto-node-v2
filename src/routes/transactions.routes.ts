import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';

import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface TransactionsDTO {
  transactions: Transaction[];
  balance: Balance;
}

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance();

  const transactionsDTO: TransactionsDTO = { transactions, balance };

  return response.json(transactionsDTO);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createService = new CreateTransactionService();

  const transaction = await createService.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteService = new DeleteTransactionService();

  await deleteService.execute({ id });

  return response.sendStatus(204);
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importService = new ImportTransactionsService();

    const transactions = await importService.execute(request.file.path);

    return response.json(transactions);
  },
);

export default transactionsRouter;
