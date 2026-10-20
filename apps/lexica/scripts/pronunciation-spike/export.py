import sys, torch, os
from onnxruntime.quantization import quantize_dynamic, QuantType
torch.set_num_threads(1)
def q(src, dst):
    quantize_dynamic(src, dst, weight_type=QuantType.QInt8, op_types_to_quantize=['MatMul', 'Gemm'])
    print(dst, round(os.path.getsize(dst)/1e6, 1), 'MB (fp32', round(os.path.getsize(src)/1e6, 1), 'MB)')

which = sys.argv[1]
if which == 'hubert':
    from transformers import AutoModelForCTC
    m = AutoModelForCTC.from_pretrained('Peacockery/hubert-base-phoneme-en').eval()
    x = torch.randn(1, 16000 * 3)
    torch.onnx.export(m, (x,), 'onnx/hubert.onnx', input_names=['input_values'], output_names=['logits'], dynamic_axes={'input_values': {1: 't'}, 'logits': {1: 'f'}}, opset_version=17, dynamo=False)
    q('onnx/hubert.onnx', 'onnx/hubert_int8.onnx')
if which == 'whisper':
    sys.path.insert(0, 'whisper-phoneme')
    from modeling_whisper_phoneme import load
    m = load('whisper-phoneme', 'cpu')
    for secs in [int(x) for x in (sys.argv[2:] or ["30", "10"])]:
        frames = secs * 100
        enc = m.encoder
        if secs != 30:
            # shorter context: cut the positional table (accuracy checked separately)
            pe = enc.positional_embedding
            enc.register_buffer('positional_embedding', pe[: frames // 2].clone(), persistent=False)
        class W(torch.nn.Module):
            def __init__(s): super().__init__(); s.m = m
            def forward(s, mel): return torch.log_softmax(s.m(mel), -1)
        mel = torch.randn(1, m.n_mels, frames)
        name = f'onnx/whisper{secs}.onnx'
        torch.onnx.export(W().eval(), (mel,), name, input_names=['mel'], output_names=['logp'], opset_version=17, dynamo=False)
        q(name, name.replace('.onnx', '_int8.onnx'))
