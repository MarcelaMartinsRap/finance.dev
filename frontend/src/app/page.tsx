"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Transaction {
  id: number;
  title: string;
  value: number;
  category: string;
  date: string;
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('Jan');

  // Carrega receitas do backend
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch('http://localhost:3001/incomes');
        const data = await res.json();
        const formatted = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          value: item.amount,
          category: item.category || 'Receita',
          date: new Date(item.date).toISOString().split("T")[0],
        }));
        setTransactions(formatted);
      } catch (error) {
        console.error("Erro ao buscar transações:", error);
      }
    };

    fetchTransactions();
  }, []);

  const handleSave = (transaction: Transaction) => {
    if (transaction.id) {
      setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t));
    } else {
      const newTransaction = { ...transaction, id: Date.now() };
      setTransactions(prev => [...prev, newTransaction]);
    }
    setIsOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: number) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const saldoAtual = transactions.reduce((acc, t) => acc + t.value, 0);
  const receitaTotal = transactions.filter(t => t.value > 0).reduce((acc, t) => acc + t.value, 0);
  const despesaTotal = transactions.filter(t => t.value < 0).reduce((acc, t) => acc + Math.abs(t.value), 0);

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-gray-800">Controle Financeiro</h1>
        <div className="mb-4">
          <p className="text-lg text-gray-600">Olá, Marcela</p>
        </div>
      </header>

      <div className="p-4 space-y-4 bg-gray-100 rounded-lg shadow-lg">
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-3xl font-bold text-green-600">R$ {saldoAtual.toFixed(2)}</h2>
          <small className="text-gray-500">Saldo atual</small>
        </div>
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-3xl font-bold text-green-600">R$ {receitaTotal.toFixed(2)}</h2>
          <small className="text-gray-500">Receita total</small>
        </div>
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h2 className="text-3xl font-bold text-red-600">R$ {despesaTotal.toFixed(2)}</h2>
          <small className="text-gray-500">Despesa total</small>
        </div>
      </div>

      <div className="flex space-x-5 overflow-x-auto ml-4">
        {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map((m) => (
          <Button
            key={m}
            variant={selectedMonth === m ? "default" : "outline"}
            className={`px-6 py-3 text-lg font-medium transition duration-200 hover:bg-gray-200 ${selectedMonth === m ? 'text-blue-600' : 'text-black'}`}
            onClick={() => setSelectedMonth(m)}
          >
            {m}
          </Button>
        ))}
      </div>

      <div className="bg-white p-4 shadow-lg rounded-lg mt-6">
        <div className="flex justify-between items-center mb-4">
          <Input placeholder="Filtrar por título" className="w-1/3 shadow-sm focus:ring-2 focus:ring-blue-500" />
          <div className="space-x-2">
            <Button variant="outline" className="hover:bg-gray-100 transition duration-200">Filtro recente</Button>
            <Button variant="outline" className="hover:bg-gray-100 transition duration-200">Filtro valor</Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditing(null)} className="bg-green-600 text-white hover:bg-green-700 transition duration-200">Adicionar</Button>
              </DialogTrigger>
              <TransactionModal transaction={editing} onSave={handleSave} />
            </Dialog>
          </div>
        </div>

        <table className="w-full text-left table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-lg text-gray-700">Título</th>
              <th className="p-3 text-lg text-gray-700">Valor</th>
              <th className="p-3 text-lg text-gray-700">Categoria</th>
              <th className="p-3 text-lg text-gray-700">Data</th>
              <th className="p-3 text-lg text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{t.title}</td>
                <td className={`p-3 ${t.value < 0 ? 'text-red-600' : 'text-green-600'}`}>R$ {Math.abs(t.value).toFixed(2)}</td>
                <td className="p-3">{t.category}</td>
                <td className="p-3">{new Date(t.date).toLocaleDateString()}</td>
                <td className="p-3 flex space-x-2">
                  <Pencil className="cursor-pointer text-yellow-600 hover:text-yellow-700" onClick={() => { setEditing(t); setIsOpen(true); }} />
                  <Trash className="cursor-pointer text-red-600 hover:text-red-700" onClick={() => handleDelete(t.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const TransactionModal = ({ transaction, onSave }: { transaction: Transaction | null, onSave: (t: Transaction) => void }) => {
  const [form, setForm] = useState<Transaction>(
    transaction || { id: 0, title: '', value: 0, category: '', date: new Date().toISOString().split('T')[0] }
  );
  const [type, setType] = useState<'income' | 'expense'>(transaction && transaction.value >= 0 ? 'income' : 'expense');

  const handleSubmit = async () => {
    const payload = {
      title: form.title,
      amount: type === 'income' ? Math.abs(form.value) : -Math.abs(form.value),
      date: new Date(form.date).toISOString(),
      user_uuid: 1,
    };

    try {
      if (type === 'income') {
        await fetch('http://localhost:3001/incomes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        console.warn('Despesa ainda não conectada ao backend.');
      }

      onSave({ ...form, value: payload.amount });
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{transaction ? 'Editar Transação' : 'Nova Transação'}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex space-x-4">
          <Button
            variant={type === 'income' ? 'default' : 'outline'}
            onClick={() => setType('income')}
          >
            Entrada
          </Button>
          <Button
            variant={type === 'expense' ? 'default' : 'outline'}
            onClick={() => setType('expense')}
          >
            Despesa
          </Button>
        </div>
        <Input
          placeholder="Título"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <Input
          placeholder="Valor"
          type="text"
          inputMode="decimal"
          value={form.value}
          onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
        />
        <Input
          placeholder="Categoria"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <Input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <Button className="w-full bg-blue-600 text-white hover:bg-blue-700" onClick={handleSubmit}>
          Salvar
        </Button>
      </div>
    </DialogContent>
  );
};
