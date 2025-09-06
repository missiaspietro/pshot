'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

type TableStatus = {
  [key: string]: boolean;
};

export default function DatabaseAdminPage() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [status, setStatus] = useState<{
    initialized: boolean;
    tables: TableStatus;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchDatabaseStatus = async () => {
    try {
      const response = await fetch('/api/database/status');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao verificar status do banco de dados');
      }

      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const initializeDatabase = async () => {
    setIsInitializing(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/database/initialize', {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao inicializar o banco de dados');
      }

      setSuccess('Banco de dados inicializado com sucesso!');
      await fetchDatabaseStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    fetchDatabaseStatus();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gerenciamento do Banco de Dados</h1>
        <p className="text-muted-foreground">
          Gerencie a inicialização e o status das tabelas do banco de dados
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Status do Banco de Dados</CardTitle>
          <CardDescription>
            Verifique o status das tabelas do banco de dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === null ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Carregando status...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center">
                <div 
                  className={`h-4 w-4 rounded-full mr-2 ${
                    status.initialized ? 'bg-green-500' : 'bg-yellow-500'
                  }`} 
                />
                <span>
                  {status.initialized 
                    ? 'Banco de dados inicializado' 
                    : 'Banco de dados não inicializado'}
                </span>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3">Tabela</th>
                      <th className="text-right p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(status.tables).map(([table, exists]) => (
                      <tr key={table} className="border-t">
                        <td className="p-3">{table}</td>
                        <td className="p-3 text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            exists 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {exists ? 'Existe' : 'Não existe'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button 
            onClick={initializeDatabase}
            disabled={isInitializing || (status?.initialized ?? false)}
          >
            {isInitializing && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isInitializing ? 'Inicializando...' : 'Inicializar Banco de Dados'}
          </Button>
        </CardFooter>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-8" role="alert">
          <strong className="font-bold">Erro: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative mb-8" role="alert">
          <strong className="font-bold">Sucesso! </strong>
          <span className="block sm:inline">{success}</span>
        </div>
      )}
    </div>
  );
}
