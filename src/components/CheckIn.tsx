"use client";

import React, { useState } from "react";

const CheckIn: React.FC = () => {
    const [ticketNumber, setTicketNumber] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateTicket = async () => {
        setLoading(true);
        setError(null);
        setTicketNumber(null);

        try {
            const response = await fetch("http://localhost:7035/api/Queue/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ serviceTypeCode: "AO" }), // Ajustar código do serviço conforme necessário
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.Message || "Erro ao gerar a senha.");
            }

            const data = await response.json();
            setTicketNumber(data.TicketNumber); // Define a senha gerada
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message); // Mensagem de erro acessível via Error.message
            } else {
                setError("Ocorreu um erro inesperado."); // Mensagem genérica
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h1>Check-in</h1>
            <p>Clique no botão abaixo para gerar sua senha de atendimento.</p>

            <button
                onClick={handleGenerateTicket}
                disabled={loading}
                style={{
                    padding: "10px 20px",
                    fontSize: "16px",
                    cursor: loading ? "not-allowed" : "pointer",
                }}
            >
                {loading ? "Gerando senha..." : "Fazer Check-in"}
            </button>

            {ticketNumber && (
                <div style={{ marginTop: "20px", fontSize: "18px", color: "green" }}>
                    <p>Sua senha gerada é:</p>
                    <strong style={{ fontSize: "24px" }}>{ticketNumber}</strong>
                </div>
            )}

            {error && (
                <div style={{ marginTop: "20px", color: "red" }}>
                    <p>Erro: {error}</p>
                </div>
            )}
        </div>
    );
};

export default CheckIn;
